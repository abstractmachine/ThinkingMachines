// twee/twine access

// get access to twee frame
let twee = document.getElementById("twee_frame").contentWindow

function setup() {
	// we're not going to draw anything with P5. We'll let Twee do all the visual communication
	noCanvas()
}

// function draw() {
// }

function keyPressed() {
	
	switch(key) {

		// card was inserted
		case ('c'):
		changeState("inserted")
		break;

		// card was inserted
		case ('x'):
		changeState("removed")
		break;

		// force generation of the story
		case ('r'):
		changeState("random")
		break;

	}

}