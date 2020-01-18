import serve from 'koa-static'
import mount from 'koa-mount'
import IOServer from 'socket.io'
import KoaSocketServer from './KoaSocketServer.js'
import {StoreData} from "./StoreData.js"
import {sendTextToClients, startClientSocketInteractions} from "./socketInteractions.js"
import path from "path"
import {getTempData, saveTempDataToFile} from "./tempDataTools.js"
import {generatePdf} from "./pdfTools.js"


import printer from "pdf-to-printer";
import {createBookDirectory} from "./fromClientDataUtils.js"

//-----
// settings
//-----
export const SETTINGS = {
    DEBUG: true,
    DEBUG_LOREM_TEXT: true,
    TEMP_DATA_FILE_NAME: ".tempData.json",
    TEMP_DATA_DIRECTORY: "./documents",
}

/**
 * @type {string}
 */
export const tempDataFilePath = path.resolve(SETTINGS.TEMP_DATA_DIRECTORY, SETTINGS.TEMP_DATA_FILE_NAME)

/**
 * @type {StoreData}
 */
export let storeData

async function main() {
    // ------
    // server init
    // ------
    const io = new IOServer()
    const server = new KoaSocketServer({io})

    server.use(mount('/book', serve('documents/')))

    // ------
    // server start
    // ------
    await server.startOrExit()

    // ------
    // global store data init
    // ------
    storeData = new StoreData(
        {
            io: io,
            onCurrentBookDirectoryChange: async (newPath, tempData) => {
                console.info("currentBookDirectory change", newPath)

                await saveTempDataToFile({
                    tempFilePath: tempDataFilePath,
                    tempData: tempData,
                })
            },
            onTextContentChange: async (newText, tempData) => {
                console.info("text has changed")

                await saveTempDataToFile({
                    tempFilePath: tempDataFilePath,
                    tempData: tempData,
                })

                sendTextToClients()

                if (newText.length < 1) {
                    console.info("end of text")
                    io.emit("ioEventServer_end_text")

                    // const pdfPath = path.resolve(storeData.tempData.bookDirectory, './document.pdf')

                    storeData.tempData.bookDirectory = await createBookDirectory()

                    // generatePdf(async () => {
                    //
                    //     console.log("pdfPath: ", pdfPath)
                    //
                    //     printer
                    //         .print(pdfPath)
                    //         .then(console.log)
                    //         .catch(console.error)
                    // })

                } else {

                }

            },
            onNewPageAdded: async (newIndex, tempData) => {
                console.info("page added", newIndex, tempData)

                await saveTempDataToFile({
                    tempFilePath: tempDataFilePath,
                    tempData: tempData,
                })
            },
            tempData: await getTempData(tempDataFilePath)
        }
    )

    await saveTempDataToFile({
        tempData: storeData.tempData,
        tempFilePath: tempDataFilePath,
    })

    console.log(storeData.tempData)

    // ------
    // socket interaction
    // ------
    io.on('connect', socket => {
        console.info("new connection")
        startClientSocketInteractions(socket)
    })

}

main().then(
    () => {
      console.info("main started")
    },
    reason => {
      console.error("main can't correctly started", reason)
    },
)
