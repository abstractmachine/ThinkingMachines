
// state variables
let currentState = ''
let cardIsInserted = false
let storyIndex = 0

function changeState(newState) {

	currentState = newState

	if (newState == "Ready") stateReady()
	else if (newState == "CardInserted") stateCardInserted()
	else if (newState == "CardRemoved") stateCardRemoved()
	else if (newState == "Ask") stateAsk()
	else if (newState == "Asked") stateAsked()
	else if (newState == "Answered") stateAnswered()
	else if (newState == "Listening") {}
	else if (newState == "StoppedListening") {}
	else console.log("Unhandled state: " + newState)

}


function stateReady() {
	// tell Twee to go to the Ready screen
	twee.goToPassage('State-Ready')
}


// set all the variables and sound states back to zero
function resetStory() {
	// set the story index back to beginning
	storyIndex = 0
}


function stateCardInserted() {
	if (cardIsInserted) {
		console.log("Error. Card was re-inserted without prior removal.")
	}
	// set the story back to zero
	resetStory()
	// ask first question
	changeState("Ask");
	// card state flag
	cardIsInserted = true
}

function stateCardRemoved() {
	// reset story variables
	resetStory()
	// stop speaking, etc
	resetSpeech()
	// go back to waiting mode
	changeState("Ready")
	// card state flag
	cardIsInserted = false
}


function stateAsk() {
	// ask a question
	twee.goToPassage("State-Ask-" + storyIndex)
}


function stateAsked() {
	// start recording answer
	speechRecStart()
}


function stateAnswered() {
	// show response
	twee.goToPassage("State-Answered-" + storyIndex)
	// stop listening
	speechRecStop()
}
