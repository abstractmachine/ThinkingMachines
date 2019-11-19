// this is the thing to control speech detection
var speech

function setup() {
	// initialize the speech detector
	speech = new p5.SpeechRec()
	// when I receive new speech, call this function
	speech.onResult = speechReceiver
	// make sure I'm constantly detecting speech
	speech.continuous = true
	speech.iterimResults = true
	// start the speech detection now
	speech.start()
}

// when I receive speech, call this function
function speechReceiver() {
	// find my id="speakable-text" element, and append the new phrase the current text
	select("#speakable-text").html(speech.resultString + ' ', true)
	// if we detect that the speech contains the phrase "print now"
	if (speech.resultString.includes("print now")) {
		Bindery.makeBook({ content: ".content" })
	}
}
