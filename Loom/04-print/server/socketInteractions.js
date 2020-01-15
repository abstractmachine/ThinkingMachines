import {storeData} from "./index.js"
import {savePage_pngFormat, savePage_svgFormat, savePngForCover, saveSvgForCover} from "./fromClientDataUtils.js"

export function startClientSocketInteractions(socket) {
    socket.on("story", async data => {
        console.info(data)

        storeData.currentText = data

        //sendTextToClients()
    })

    socket.on("ioEventClient_connection_layout", async () => {
        console.info("new client connection: text layout")
        sendTextToClients()
    })

    socket.on('ioEventClient_layout_newData', async data => {

        console.info('Socket', socket.id, 'send data')

        if(data !== null) {
            await savePage_svgFormat(data.textSvg)

            await saveSvgForCover(data.pathSvg)

            storeData.currentText = data.unconsumedText
        }
    })

    // illustration
    socket.on("ioEventClient_connection_illustration", () => {
        console.info("new client connection: illustration")
    })

    socket.on("ioEventClient_illustration_newData", async data => {
        await savePage_pngFormat({
            pngDataBase64: data.imgBase64,
        })

        await savePngForCover(data.contour)

    })
}

export function sendTextToClients() {
    storeData.io.emit("ioEventServer_send_text", storeData.currentText)
}
