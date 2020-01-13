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

let text = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce in vulputate elit. Nunc efficitur ipsum venenatis, placerat ante eu, pharetra justo. Pellentesque consectetur justo malesuada lectus ullamcorper aliquet. Duis ultrices luctus diam quis molestie. Nunc augue eros, viverra non est in, placerat hendrerit metus. Phasellus aliquam dignissim nulla, ac commodo lectus placerat vitae. Aliquam tempus vel quam ac lacinia. Aenean vitae sodales eros.

Etiam est nisi, placerat eget interdum vel, bibendum non nisi. Aenean molestie, tortor pretium lobortis luctus, massa massa mollis tellus, dignissim blandit sem magna sed mauris. Ut ullamcorper libero lacus, tincidunt congue lorem tincidunt eget. Pellentesque sodales diam purus, sed tincidunt sapien ornare eu. Donec feugiat congue enim, ac sollicitudin eros aliquet sit amet. Mauris nec viverra lectus, hendrerit volutpat ligula. Nam pellentesque sollicitudin erat. Cras laoreet vehicula volutpat. Pellentesque vestibulum varius odio ut mattis.

Nulla convallis dolor et aliquet molestie. Nulla felis sem, auctor et pharetra eu, blandit elementum velit. Pellentesque elementum auctor metus, elementum rutrum risus pulvinar vel. Praesent ultricies felis lacinia volutpat scelerisque. Ut consequat diam nisl, sit amet fermentum ex consectetur id. Ut ut pulvinar metus. Suspendisse maximus molestie tincidunt.

Morbi volutpat elit ac finibus porta. Nullam nulla erat, facilisis eu blandit at, accumsan a dui. Phasellus consectetur velit vel odio maximus imperdiet. Nulla purus justo, sagittis vitae placerat quis, convallis sed purus. Maecenas ullamcorper, augue laoreet varius ullamcorper, purus lectus cursus lorem, vel tristique lorem odio at leo. Maecenas maximus nunc eleifend leo suscipit dapibus. Pellentesque orci elit, mollis ut tempor quis, convallis sed ligula. Ut auctor est vel molestie fermentum. Donec mattis ut felis non eleifend. In eleifend nulla vel metus facilisis, a eleifend nunc interdum. Mauris malesuada condimentum lectus quis ultrices.`

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
  onSend: () => {
    console.info("layout updating stoped")

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

  const initialText = "send layout"
  const dataSending = "layout saving…"

  buttonElement.innerText = initialText

  buttonElement.addEventListener('click', () => {
    if(updatePathLayoutFromVideo) {
      onSend()
      buttonElement.innerText = dataSending
    }
  })
}
