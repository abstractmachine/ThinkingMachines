import {promises} from "fs"
import path from "path"
import {pad} from './utlis.js'
import {storeData} from "./index.js"

/**
 * @param {{unconsumedText: string, svg: string}} layoutData
 * @return {Promise<boolean | string>} false if error, true if ended of text or unconsumedText
 */
export async function processLayoutDataFromClient(layoutData) {
    const pathOfNewPage = path.resolve(storeData.pathOfCurrentBookDirectory, "file.svg")

    await promises.writeFile(pathOfNewPage, layoutData.svg)

    storeData.currentText = layoutData.unconsumedText
}

/**
 * @return {Promise<string>}
 */
export async function getPathOfCurrentDirectory() {

    console.info('find current directory (last book was ended or not)')

    const lastBookDirectory = await getLastBookDirectoryInDocuments()

    const pathOfLastBookDirectory = path.resolve("./documents", lastBookDirectory)

    const lastDirectoryHasTempDataFile = await directoryHasTempData(pathOfLastBookDirectory)

    if(lastDirectoryHasTempDataFile) {
        console.info("last directory has datafile")
        return pathOfLastBookDirectory
    } else {
        console.info("last book finished")
        return await createBookDirectory()
    }
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

        console.log(pathOfNewBookDirectory)

        await promises.mkdir(pathOfNewBookDirectory, {recursive: true})

        const date = new Date()
        const dataDirectory = {
            date: date,
        }

        const dataFilePath = path.resolve(pathOfNewBookDirectory, "data.json")

        await promises.writeFile(dataFilePath, JSON.stringify(dataDirectory))

        console.info("new book directory created")

        return pathOfNewBookDirectory
    } catch (e) {
        console.error("can't create new directory of book", e)
    }
}

export async function directoryHasTempData(directory, tempDataFileName = ".tempData.txt") {
    const tempFilePath = path.resolve(directory, tempDataFileName)

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

export function setTempData() {

}
