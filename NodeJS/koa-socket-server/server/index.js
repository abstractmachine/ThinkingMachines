import serve from 'koa-static'
import mount from 'koa-mount'
import IOServer from 'socket.io'
import KoaSocketServer from './KoaSocketServer.js'
import {
    processLayoutDataFromClient,
    fileExist, createBookDirectory, getJSObjectFromJSONFile,
} from "./fromClientDataUtils.js"
import {StoreData} from "./StoreData.js"
import {sendTextToClients, startClientSocketInteractions} from "./socketInteractions.js"
import path from "path"
import {generatedDefaultTempData, getTempData, getRestoredData} from "./tempDataTools.js"

export const SETTINGS = {
    DEBUG: true,
    TEMP_DATA_FILE_NAME: ".tempData.json",
    TEMP_DATA_DIRECTORY: "./documents",
}

// ------
// global status
// ------

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

    server.use(serve('./client'))

    // Server the web-modules, built by Pika
    server.use(mount('/web_modules', serve('./web_modules')))

    // ------
    // server start
    // ------
    await server.startOrExit()

    // ------
    // global store data init
    // ------
    const fileDataPath = path.resolve(SETTINGS.TEMP_DATA_DIRECTORY, SETTINGS.TEMP_DATA_FILE_NAME)

    storeData = new StoreData(
        {
            io: io,
            onCurrentBookDirectoryChange: (newPath) => {
                console.info("currentBookDirectory change", newPath)
            },
            onTextContentChange: (newText) => {
                console.info("text has changed")
                if (newText.length > 0) {
                    sendTextToClients()
                }
            },
            tempData: await getTempData()
        },
    )

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
