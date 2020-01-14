import {storeData} from "./index.js"
import {savePage_pngFormat, savePage_svgFormat} from "./fromClientDataUtils.js"

export function startClientSocketInteractions(socket) {
    socket.on("ioEventClient_connection_layout", async () => {
        console.info("new client connection: text layout")
        sendTextToClients()
    })

    socket.on('ioEventClient_layout_newData', async layoutData => {

        console.info('Socket', socket.id, 'send data')

        await savePage_svgFormat(layoutData.svg)

        storeData.currentText = layoutData.unconsumedText
    })

    // illustration
    socket.on("ioEventClient_illustration_newData", async data => {
        console.log(data.imgBase64)
        await savePage_pngFormat({
            pngDataBase64: data.imgBase64
        })
    })
}

export function sendTextToClients() {
    storeData.io.emit("ioEventServer_send_text", storeData.currentText)
}
