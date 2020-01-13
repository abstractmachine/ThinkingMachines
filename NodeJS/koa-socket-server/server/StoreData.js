import {SETTINGS} from "./index.js"

export class StoreData {
    /**
     * @type {TempData}
     */
    #tempData
    get tempData() {
        return this.#tempData
    }

    get pathOfCurrentBookDirectory() {return this.tempData.bookDirectory}
    set pathOfCurrentBookDirectory(value) {
        this.#tempData.bookDirectory = value
        this.onCurrentBookDirectoryChange(this.tempData.bookDirectory, this.tempData)
    }

    get currentText() {return this.tempData.currentText}
    set currentText(value) {
        this.#tempData.currentText = value
        this.onTextContentChange(this.tempData.currentText, this.tempData)
    }

    /**
     *
     * @param io
     * @param onCurrentBookDirectoryChange
     * @param onTextContentChange
     * @param tempData {TempData}
     */
    constructor({
                    io,
                    onCurrentBookDirectoryChange = (newPath, tempData) => {
                        console.info("directory change event")
                    },
                    onTextContentChange = (newText, tempData) => {
                        console.info("text change event")
                    },
                    tempData,
                }) {
        this.io = io

        this.onCurrentBookDirectoryChange = onCurrentBookDirectoryChange
        this.onTextContentChange = onTextContentChange

        this.#tempData = tempData

        console.info(this.tempData)
    }
}
