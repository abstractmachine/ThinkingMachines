// Sketch One
const p5_sketch_1 = (p5) => { // p5 could be any variable name
	let x = 100
	let y = 100
	let speed = 2.5

	p5.setup = () => {
		p5.createCanvas(400, 200)
	}

	p5.draw = function() {
		p5.background(0)
		p5.fill(255)
		p5.rect(x,y,50,50)
		y -= speed

		if(y < 0){
			y = p5.height
		}
	}
}
const myP51 = new p5(p5_sketch_1, "p5-container-1")

// Sketch Two
const p5_sketch_2 = (p5) => { // p5 could be any variable name
	let x 	= 100.0
	let y 	= 100
	let speed = 2.5

	p5.setup = () => {
		p5.createCanvas(400, 200)
	};

	p5.draw = () => {
		p5.background(100)
		p5.fill(1)
		x += speed

		if(x > p5.width){
			x = 0
		}

		p5.ellipse(x,y,50,50)
	}
}
const myP52 = new p5(p5_sketch_2, "p5-container-2")



/**
 * Save HTMLCanvasElement content to an img HTMLElement by query selector
 * @param {p5.Renderer} canvasSelector		- p5 Renderer canvas to convert in to an HTMLImgElement
 * @param {p5.Element|null} elementSelector - image element selected with select() P5 function
 * */
function canvasToImageElement(canvasSelector, elementSelector) {

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
