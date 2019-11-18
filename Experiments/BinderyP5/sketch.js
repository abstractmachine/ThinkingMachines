let p5Canvas;

function setup() {

	let p5Id = document.getElementById('p5')
	p5Canvas = createCanvas(250, 250)
	p5Canvas.parent(p5Id)

	background(255, 0, 0)

	ellipse(width / 2, height / 2, width, height)


}

function keyPressed() {
	if (key == ' ') {

		let p5Img = select("#p5Image")
		canvasToImageElement(p5Canvas, p5Img)
		p5Img.width = p5Canvas.width
		p5Img.height = p5Canvas.height

		Bindery.makeBook({ content: ".content" })
	}
}


function canvasToImageElement(canvasSelector, elementSelector) {
	elementSelector.elt.src = canvasSelector.elt.toDataURL("image/png")
}
