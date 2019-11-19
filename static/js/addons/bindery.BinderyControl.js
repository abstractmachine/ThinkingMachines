class BinderyControl {

    constructor() {
        this.makeBookUIButton = this._createUIButton()
        return this
    }

    async makeBook() {
        await this._canvasToImageElement()
        await Bindery.makeBook({ content: ".content" })
        this.makeBookUIButton.style.display = "none"
    }

    /**
     * add button element to body html content with a click event listener
     * @private
     * @return {HTMLButtonElement} - HTMLButtonElement added to body element
     * */
    _createUIButton() {
        const uiButton = document.createElement("button")
        uiButton.textContent = "generate book"

        uiButton.style.position 		= "fixed"
        uiButton.style.top 				= "10px"
        uiButton.style.right 			= "10px"
        uiButton.style.borderRadius 	= "0"
        uiButton.style.border 			= "none"
        uiButton.style.backgroundColor 	= "black"
        uiButton.style.color 			= "white"
        uiButton.style.padding 			= "1em"
        uiButton.style.lineHeight 		= "1em"
        uiButton.style.fontSize 		= "12px"
        uiButton.style.cursor 			= "pointer"

        document.body.appendChild(uiButton)

        uiButton.addEventListener("click", async () => {
            this.makeBook()
        })

        return  uiButton
    }

    // todo: don't remove canvas element and save HTMLImageElement generated
    /**
     * Save HTMLCanvasElement content to an img HTMLElement by query selector
     * @private
     * */
    async _canvasToImageElement() {

        const listOfCanvasElement = document.querySelectorAll(".content canvas")

        for await (let canvas of listOfCanvasElement) {

            const canvasParentElement = canvas.parentElement

            if(canvasParentElement instanceof HTMLParagraphElement) {

                const imgForReplaceCanvas 	= new Image()

                imgForReplaceCanvas.width 	= canvas.getBoundingClientRect().width
                imgForReplaceCanvas.height 	= canvas.getBoundingClientRect().height
                imgForReplaceCanvas.src 	= canvas.toDataURL("image/png")

                canvasParentElement.appendChild(imgForReplaceCanvas)
                canvasParentElement.removeChild(canvas)
            } else {
                console.error("p5 canvas elements must be placed in a HTMLParagraphElement parent node:\n<p><canvas id='p5-canvas'></canvas></p>\n", canvas)
            }
        }
    }
}
