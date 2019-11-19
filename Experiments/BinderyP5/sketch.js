let p5Canvas;

function setup() {

	let p5Id = document.getElementById('p5')
	p5Canvas = createCanvas(250, 250)
	p5Canvas.parent(p5Id)

	background(255, 0, 0)

	ellipse(width / 2, height / 2, width, height)


}

function keyPressed() {
	if (key === ' ') {

		let p5Img = select("#p5Image")
		canvasToImageElement(p5Canvas, p5Img)

		Bindery.makeBook({ content: ".content" })
	}
}

/**
 * Save HTMLCanvasElement content to an img HTMLElement by query selector
 * @param {p5.Renderer} canvasSelector		- p5 Renderer canvas to convert in to an HTMLImgElement
 * */
function canvasToImageElement(canvasSelector) {

	const canvasParentElement = canvasSelector.parent()

	if(canvasParentElement instanceof HTMLParagraphElement) {
		const imgElement = new Image()

		imgElement.width 	= canvasSelector.width
		imgElement.height 	= canvasSelector.height
		imgElement.src 		= canvasSelector.elt.toDataURL("image/png")

		canvasParentElement.appendChild(imgElement)
		canvasParentElement.removeChild(canvasSelector.elt)
	} else {
		console.error("p5 canvas elements must be placed in a HTMLParagraphElement parent node:\n<p><canvas id='p5-canvas'></canvas></p>\n", canvasSelector.elt)
	}

}
