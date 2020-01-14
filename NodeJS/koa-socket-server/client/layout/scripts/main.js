import {fillPathsWithText} from './textToPaht.js'
import {setupVideo, findContourPaths, filterPaths} from "./contourDetection.js"
import io from "../../web_modules/socket.io-client/dist/socket.io.js"
import paper from "../../web_modules/paper/dist/paper-full.js"

// parameters
let textToPathSettings = {
  leading: 22, // <- this is another word for line-height
  fontSize: 19,
  fontFamily: 'Helvetica Neue',
  fontWeight: 'normal',
  fillColor: 'black'
}

// paper init
paper.setup("canvas")

// socket init
const socket = io()

// global
let updatePathLayoutFromVideo = true
let globalPaths = []

let text = "lorem ipsum"

//-----
// socket events
//-----
socket.on("connect", () => {
  socket.emit("ioEventClientConnectedText")
})

socket.on("ioEventServerSendText", (textFromServer) => {
  console.log("new text", textFromServer)

  text = textFromServer

  updatePathLayoutFromVideo = true
})

//-----
// Setup video once OpenCV is ready:
//-----
cv.onRuntimeInitialized = () => {
  setupVideo().then(() => {
    paper.view.onFrame = () => {

      if (updatePathLayoutFromVideo) {
        const paths = findContourPaths(video, canvas)
        globalPaths = filterPaths(paths)

        try {
          fillPathsWithText(globalPaths, text, textToPathSettings)
        } catch (e) {
          console.error(e)
        }
      }
    }
  })
}

createButtonToSendLayout({
  onSend: (buttonElement) => {
    console.info("layout updating stoped")

    buttonElement.innerText = "send layout"
    updatePathLayoutFromVideo = false

    const unconsumedText = fillPathsWithText(globalPaths, text, textToPathSettings)

    const svg = paper.project.exportSVG().outerHTML

    socket.emit("ioEventClientTextNewLayout", {
      unconsumedText: unconsumedText,
      svg: svg,
    })
  }
})

/**
 * @param {Function} onSend
 */
function createButtonToSendLayout({onSend: onSend}) {
  const buttonElement = document.querySelector("#button-send-layout");

  buttonElement.innerText = "send layout"

  buttonElement.addEventListener('click', () => {
    if(updatePathLayoutFromVideo) {
      onSend(buttonElement)
      buttonElement.innerText = "layout saving…"
    }
  })
}
