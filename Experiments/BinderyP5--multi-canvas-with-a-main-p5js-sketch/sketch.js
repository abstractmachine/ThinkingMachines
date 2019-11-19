// create binderyControl
const binderyControl = new BinderyControl();

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


// main sketch
function setup() {
	console.info("main p5js sketch:\n", "access to other p5js sketches\n", myP51, "\n", myP52)
}

function draw() {

}
