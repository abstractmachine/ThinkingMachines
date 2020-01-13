export class StoreData {

    /**
     * @type {null || string}
     */
    #pathOfCurrentBookDirectory = null
    get pathOfCurrentBookDirectory() {return this.#pathOfCurrentBookDirectory}
    set pathOfCurrentBookDirectory(value) {
        this.#pathOfCurrentBookDirectory = value
        this.onCurrentBookDirectoryChange(this.#pathOfCurrentBookDirectory)
    }

    #currentText = ""
    get currentText() {return this.#currentText}
    set currentText(value) {
        this.#currentText = value
        this.onTextContentChange(this.#currentText)
    }

    /**
     *
     * @param io
     * @param onCurrentBookDirectoryChange
     * @param onTextContentChange
     */
    constructor(
        {
            io,
            onCurrentBookDirectoryChange = (newPath) => {
                console.info("directory change event")
            },
            onTextContentChange = (newText) => {
                console.info("text change event")
            },
        },
    ) {
        this.io = io

        this.onCurrentBookDirectoryChange = onCurrentBookDirectoryChange
        this.onTextContentChange = onTextContentChange
    }
}
