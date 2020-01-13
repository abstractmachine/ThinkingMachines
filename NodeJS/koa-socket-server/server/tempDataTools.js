import {createBookDirectory, fileExist, getJSObjectFromJSONFile} from "./fromClientDataUtils.js"

/**
 * return restored and cleaned TempData or generate formatted one
 * @param fileDataPath {string}
 * @return {Promise<TempData>}
 */
export async function getTempData(fileDataPath) {
    const appHasTempDataFile = await fileExist(fileDataPath)

    const defaultData = await generatedDefaultTempData()

    return appHasTempDataFile ? await getRestoredData({fileDataPath: fileDataPath, defaultData: defaultData}) : defaultData
}

/**
 * @param fileDataPath {string}
 * @param defaultData {TempData}
 * @return {Promise<TempData>}
 */
export async function getRestoredData({fileDataPath, defaultData}) {

    try {
        const dataToReturn  = await getJSObjectFromJSONFile(fileDataPath)

        // test date
        try {
            dataToReturn.date = new Date(dataToReturn.date)
        } catch {
            console.error("can't restored saved date, new generated")
            dataToReturn.date = new Date()
        }

        // test currentText
        try {
            if(typeof dataToReturn.currentText !== "string") {
                console.error("can't restored saved currentText, new generated")
                dataToReturn.currentText = defaultData.currentText
            }
        } catch {
            console.error("can't restored saved currentText, new generated")
            dataToReturn.currentText = defaultData.currentText
        }

        // test bookDirectory
        try {
            const bookDirectoryExist = await fileExist(dataToReturn.bookDirectory)
            if(! bookDirectoryExist) {
                console.error("can't restored saved bookDirectory, new generated")
                dataToReturn.bookDirectory = createBookDirectory()
            }
        } catch {
            console.error("can't restored saved bookDirectory, new generated")
            dataToReturn.bookDirectory = createBookDirectory()
        }

        // test pageIndex
        try {
            if(typeof dataToReturn.pageIndex !== "number") {
                console.error("can't restored saved pageIndex, new generated")
                dataToReturn.pageIndex = defaultData.pageIndex
            }
        } catch {
            console.error("can't restored saved pageIndex, new generated")
            dataToReturn.pageIndex = defaultData.pageIndex
        }


        return dataToReturn

    } catch (e) {
        return defaultData
    }
}

/**
 * @return {Promise<TempData>}
 */
export async function generatedDefaultTempData() {
    return {
        date:           new Date(),
        currentText:    "",
        bookDirectory:  await createBookDirectory(),
        pageIndex:      0
    }
}
