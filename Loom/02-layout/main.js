import { captureVideo, findContourPaths } from './scripts/contourPaths.js'
import { fillPathsWithText } from './scripts/areaText.js'

// Setup Paper.js
paper.install(window)
paper.setup('canvas')

// Settings
let textSettings = {
  leading: 22, // <- this is another word for line-height
  fontSize: 19,
  fontFamily: 'Helvetica Neue',
  fontWeight: 'normal',
  fillColor: 'black',
  showBaseLine: false
}

let text = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce in vulputate elit. Nunc efficitur ipsum venenatis, placerat ante eu, pharetra justo. Pellentesque consectetur justo malesuada lectus ullamcorper aliquet. Duis ultrices luctus diam quis molestie. Nunc augue eros, viverra non est in, placerat hendrerit metus. Phasellus aliquam dignissim nulla, ac commodo lectus placerat vitae. Aliquam tempus vel quam ac lacinia. Aenean vitae sodales eros.

Etiam est nisi, placerat eget interdum vel, bibendum non nisi. Aenean molestie, tortor pretium lobortis luctus, massa massa mollis tellus, dignissim blandit sem magna sed mauris. Ut ullamcorper libero lacus, tincidunt congue lorem tincidunt eget. Pellentesque sodales diam purus, sed tincidunt sapien ornare eu. Donec feugiat congue enim, ac sollicitudin eros aliquet sit amet. Mauris nec viverra lectus, hendrerit volutpat ligula. Nam pellentesque sollicitudin erat. Cras laoreet vehicula volutpat. Pellentesque vestibulum varius odio ut mattis.

Nulla convallis dolor et aliquet molestie. Nulla felis sem, auctor et pharetra eu, blandit elementum velit. Pellentesque elementum auctor metus, elementum rutrum risus pulvinar vel. Praesent ultricies felis lacinia volutpat scelerisque. Ut consequat diam nisl, sit amet fermentum ex consectetur id. Ut ut pulvinar metus. Suspendisse maximus molestie tincidunt.

Morbi volutpat elit ac finibus porta. Nullam nulla erat, facilisis eu blandit at, accumsan a dui. Phasellus consectetur velit vel odio maximus imperdiet. Nulla purus justo, sagittis vitae placerat quis, convallis sed purus. Maecenas ullamcorper, augue laoreet varius ullamcorper, purus lectus cursus lorem, vel tristique lorem odio at leo. Maecenas maximus nunc eleifend leo suscipit dapibus. Pellentesque orci elit, mollis ut tempor quis, convallis sed ligula. Ut auctor est vel molestie fermentum. Donec mattis ut felis non eleifend. In eleifend nulla vel metus facilisis, a eleifend nunc interdum. Mauris malesuada condimentum lectus quis ultrices.`

/*
// Setup socket.io
//var socket = io('http://socketchat.alda.prossel.info/');
var socket = io("http://0.0.0.0:8000/");

socket.on('connect', function(){
  console.log("socket connected");

  socket.emit("ioEventClient_connection_layout")
});
*/

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
    let canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    let videoSize = new Size(canvas)
    view.onFrame = () => {
      let scale = view.viewSize.divide(videoSize)
      console.log(view.viewSize)
      view.zoom = Math.min(scale.width, scale.height)
      view.center = videoSize.divide(2)
      project.clear()
      let pathLayer = project.activeLayer
      let paths = findContourPaths(video, canvas)
      let textLayer = new Layer()
      let { textItems, unconsumedText } = fillPathsWithText(paths, text, textSettings)
      let { pathSvg, textSvg } = getSVGData({ pathLayer, textLayer })
    }
  }
}

function getSVGData({ pathLayer, textLayer }) {
  textLayer.remove()
  let pathSvg = project.exportSVG({ asString: true })
  pathLayer.remove()
  project.addLayer(textLayer)
  let textSvg = project.exportSVG({ asString: true })
  project.addLayer(pathLayer)
  return { pathSvg, textSvg }
}