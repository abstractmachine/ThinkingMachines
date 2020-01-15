import { captureVideo, findContourPaths } from './scripts/contourPaths.js'
import { fillPathsWithText } from './scripts/areaText.js'

// global data to send

let dataToSend

// Setup Paper.js
paper.install(window)
paper.setup('canvas')

// Settings
let fontSize = 12

let textSettings = {
  leading: fontSize * 1.2, // <- this is another word for line-height
  fontSize: 19,
  fontFamily: 'Helvetica Neue',
  fontWeight: 'normal',
  fillColor: 'black',
  showBaseLine: false
}

// Adjust values once camera is well positioned:
let crop = {
  top: 25,
  right: 100,
  bottom: 25,
  left: 100
}

let text = ""


// Setup socket.io
//var socket = io('http://socketchat.alda.prossel.info/');
const socket = io("http://0.0.0.0:8000/");

socket.on('connect', function(){
  console.log("socket connected");

  socket.emit("ioEventClient_connection_layout")
});

socket.on('ioEventServer_send_text', currentText => {
  console.log("current text:", currentText)
  text = currentText
})


// Setup once OpenCV is ready:
cv.onRuntimeInitialized = setupVideo
if (cv.runtimeInitialized) {
  // See index.html for this work-around
  setupVideo()
}

async function setupVideo() {
  // Grab video element and associate it with the camera
  // See https://davidwalsh.name/browser-camera
  let video = document.getElementById('video')
  // Get access to the camera:
  if (await (captureVideo(video))) {
    // Create a canvas to draw video frames to, in order to find contours.
    let canvas = document.getElementById('video-canvas')
    let videoSize = new Size(video.videoWidth, video.videoHeight)
    let canvasSize = videoSize.subtract([crop.left + crop.right, crop.top + crop.bottom])
    canvas.width = canvasSize.width
    canvas.height = canvasSize.height
    view.onFrame = () => {
      let scale = view.viewSize.divide(canvasSize)
      view.zoom = Math.min(scale.width, scale.height)
      view.center = canvasSize.divide(2)
      project.clear()
      let pathLayer = project.activeLayer
      let paths = findContourPaths(
        video,
        canvas,
        crop,
        {
          minArea: 32,
          approxPolyEpsilon: 1
        },
        {
          strokeColor: 'black',
          strokeScaling: false
        }
      )

      if(text.length > 0) {
        let textLayer = new Layer()
        let { textItems, unconsumedText } = fillPathsWithText(paths, text, textSettings)
        let { pathSvg, textSvg } = exportSVG({ pathLayer, textLayer })

        dataToSend = {
          unconsumedText,
          pathSvg,
          textSvg,
        }
      } else {
        dataToSend = null
      }
    }
  }
}

window.addEventListener("mousedown", (e) => {
  e.preventDefault()
  console.log(dataToSend)

  socket.emit("ioEventClient_layout_newData", dataToSend)
})

function exportSVG({ pathLayer, textLayer }) {
  textLayer.remove()
  let pathSvg = project.exportSVG({ asString: true })
  pathLayer.remove()
  project.addLayer(textLayer)
  let textSvg = project.exportSVG({ asString: true })
  project.addLayer(pathLayer)
  return { pathSvg, textSvg }
}
