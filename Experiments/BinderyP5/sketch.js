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
 * @param {p5.Element|null} elementSelector - image element selected with select() P5 function
 * */
function canvasToImageElement(canvasSelector, elementSelector) {
	elementSelector.elt.src = canvasSelector.elt.toDataURL("image/png")
}
