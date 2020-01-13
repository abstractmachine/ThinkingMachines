// twee/twine access
let twee

function setup() {
	// we're not going to draw anything with P5. We'll let Twee do all the visual communication
	noCanvas()
	// get access to twee frame
	twee = document.getElementById("twee_frame").contentWindow
	// tell twee how to acces this window
	twee.setParentInstance(this)
}

// function draw() {
// }

function keyPressed() {
	
	switch(key) {

		// card was inserted
		case ('c'):
		changeState("CardInserted")
		break;

		// card was inserted
		case ('x'):
		changeState("CardRemoved")
		break;

	}

}