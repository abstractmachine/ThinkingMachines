import {SETTINGS} from "./index.js"

export class StoreData {
    /**
     * @type {TempData}
     */
    #tempData
    /**
     * @return {TempData}
     */
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

    incrementPageIndex() {
        this.#tempData.pageIndex++
        this.onNewPageAdded(this.tempData.pageIndex, this.tempData)
    }

    /**
     *
     * @param io
     * @param onCurrentBookDirectoryChange
     * @param onTextContentChange
     * @param onNewPageAdded
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
                    onNewPageAdded = (newIndex, tempDate) => {
                        console.info("page added")
                    },
                    tempData,
                }) {
        this.io = io

        this.onCurrentBookDirectoryChange = onCurrentBookDirectoryChange
        this.onTextContentChange = onTextContentChange
        this.onNewPageAdded = onNewPageAdded

        this.#tempData = tempData

    }
}
