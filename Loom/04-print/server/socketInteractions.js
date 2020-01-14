import {storeData} from "./index.js"
import {savePage_svgFormat} from "./fromClientDataUtils.js"

export function startClientSocketInteractions(socket) {
    socket.on("ioEventClientConnectedText", async () => {
        console.info("new client connection: text layout")
        sendTextToClients()
    })

    socket.on('ioEventClientTextNewLayout', async layoutData => {

        console.info('Socket', socket.id, 'send data')

        await savePage_svgFormat(layoutData.svg)

        storeData.currentText = layoutData.unconsumedText
    })
}

export function sendTextToClients() {
    storeData.io.emit("ioEventServerSendText", storeData.currentText)
}
