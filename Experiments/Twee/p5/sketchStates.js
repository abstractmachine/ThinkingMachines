
// state variables
let currentState = ''
let cardIsInserted = false;

function changeState(newState) {

	currentState = newState

	if (newState == "Ready") stateReady()
	else if (newState == "Answered") stateAnswered()
	else if (newState == "CardInserted") stateCardInserted()
	else if (newState == "CardRemoved") stateCardRemoved()
	else if (newState == "Asked") stateAsked()
	else console.log("Unhandled state: " + newState)

}


function stateReady() {
	twee.goToPassage('State-Ready')
}


function resetStory() {
	resetSpeech()
}


function stateCardInserted() {
	if (cardIsInserted) {
		console.log("Error. Card was re-inserted without prior removal.")
	}

	newCard()
	cardIsInserted = true
}

function stateCardRemoved() {
	cardIsInserted = false
	resetStory()
	changeState("Ready")
}


function newCard() {
	twee.goToPassage("State-NewCard")
}


function stateListening() {
	twee.goToPassage('State-Listening')
}


function stateAsked() {
	twee.goToPassage("State-Listening")
	speechStartListening()
}


function stateAnswered() {
	twee.goToPassage("State-Answered")
	speechStopListening()
}
