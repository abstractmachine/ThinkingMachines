import {processLayoutDataFromClient} from "./fromClientDataUtils.js"
import {storeData} from "./index.js"

export function startClientSocketInteractions(socket) {
    socket.on("ioEventClientConnectedText", async () => {
        console.info("new client connection: text layout")
    })

    socket.on('ioEventClientTextNewLayout', layoutData => {

        console.info('Socket', socket.id, 'send data')

        processLayoutDataFromClient(layoutData)
    })
}

export function sendTextToClients() {
    storeData.io.emit("ioEventServerSendText", storeData.currentText)
}
