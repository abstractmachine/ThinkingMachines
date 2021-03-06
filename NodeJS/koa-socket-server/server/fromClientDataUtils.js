import {promises} from "fs"
import path from "path"
import {pad} from './utlis.js'
import {storeData} from "./index.js"

/**
 * @param {string} svgData
 * @return {Promise<boolean | string>} false if error, true if ended of text or unconsumedText
 */
export async function savePage_svgFormat(svgData) {

    const pageIndex = pad(storeData.tempData.pageIndex, 5)

    const pathOfNewPage = path.resolve(storeData.pathOfCurrentBookDirectory, `${pageIndex}page.svg`)

    storeData.incrementPageIndex()

    await promises.writeFile(pathOfNewPage, svgData)
}

export async function getLastBookDirectoryInDocuments() {
    const documentsDirectory = await promises.readdir("./documents")
    return documentsDirectory[documentsDirectory.length - 1]
}

export async function createBookDirectory() {
    try {
        const documentsDirectory = await promises.readdir("./documents")

        const bookDirectoryIndex = pad(documentsDirectory.length, 5)

        const pathOfNewBookDirectory = path.resolve('./documents', `book${bookDirectoryIndex}`)

        await promises.mkdir(pathOfNewBookDirectory, {recursive: true})

        console.info("new book directory created at: ", pathOfNewBookDirectory)

        return pathOfNewBookDirectory
    } catch (e) {
        console.error("can't create new directory of book", e)
    }
}

/**
 * @param tempFilePath
 * @return {Promise<Boolean>}
 */
export async function fileExist(tempFilePath) {
    return new Promise(resolve => {
        promises.access(tempFilePath).then(
            value => {
                resolve(true)
            },
            reason => {
                resolve(false)
            },
        )
    })
}

export async function getJSObjectFromJSONFile(path) {
    try {
        const fileContent = await promises.readFile(path, {encoding: "utf8"})
        return await JSON.parse(fileContent)
    } catch (e) {
        return await e
    }
}
