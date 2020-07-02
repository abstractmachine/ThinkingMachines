// twee/twine access

// get access to twee frame
let twee = document.getElementById("twee_frame").contentWindow

function setup() {
	// we're not going to draw anything with P5. We'll let Twee do all the visual communication
	noCanvas()
}

function draw() {
}

function keyPressed() {

	switch(key) {

		// card was inserted Scan
		case ('s'):
			changeState("inserted")
			break;

		// todo: Douglas déclancher ce choix dans Twin
		case ('a'):
			console.log("choix: a")
			break;
		case ('b'):
			console.log("choix: b")
			break;

		// card was inserted
		case ('x'):
		changeState("removed")
		break;

		// force generation of the story
		case ('g'):
			console.log("random generated")
			changeState("random")
			break;

	}

}

function cardAdded(options) {
	if (cardIsInserted) return
	setTimeout(() => {
		// console.log('cardAdded', options)
		for(k in options) {
			console.log(k, options[k])

			// invert options (true > false)
			let newState = !options[k]

			let keyName = "" + k
			twee.setVariable(keyName, newState ? "true" : "false")

		}
		changeState("inserted")
	}, 5000)

	/*

forest {random: true, stranger: true, wolf: true, prince: true}
sketch.js:42 weapon {random: true, hammer: true, stones: true, knife: true}
sketch.js:42 friends {random: true, release: true, safe: true, help: true}
sketch.js:42 body {random: true, hiding: true, biting: true, swallowing: true}
sketch.js:42 enemies {random: true, lure: true, kill: true, eat: true}
sketch.js:42 birds {random: true, pass: true, hearing: true}
sketch.js:42 window {random: true, slide: true, slam: true, knock: true}
sketch.js:42 time {random: true, singing: true, running: true, jumping: true}
sketch.js:42 vacation {random: true, fair: true, lake: true}
sketch.js:42 victim {random: true, market: true, beach: true, valley: true}
sketch.js:42 running {random: true, pluto: true, desert: true, woods: true}
sketch.js:42 dying {random: true, vervain: true, antidote: true, food: true}
sketch.js:42 cup {random: true, large: true, medium: true, little: true}

	*/
}

function cardRemoved() {
	// console.log('cardRemoved')
	// changeState("removed")
}
