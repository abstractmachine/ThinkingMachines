
// state variables
let currentState = ''
let cardIsInserted = false
let storyIndex = 0

function changeState(newState) {

	currentState = newState

	if (newState == "ready") stateReady()
	else if (newState == "inserted") stateCardInserted()
	else if (newState == "removed") stateCardRemoved()
	else if (newState == "random") stateRandom()
	else if (newState == "ask") stateAsk()
	else if (newState == "asked") stateAsked()
	else if (newState == "answered") stateAnswered()
	else if (newState == "validate") stateValidate()
	else if (newState == "validated") stateValidated()
	else if (newState == "finished") stateFinished()
	else if (newState == "listening") {}
	else if (newState == "deaf") {}
	else console.log("unhandled state: " + newState)

}


function stateReady() {
	// set the story back to zero
	resetStory()
	// tell Twee to go to the Ready screen
	twee.goToPassage('State-Ready')
	showScanner(true)
}


// set all the variables and sound states back to zero
function resetStory() {
	// set the story index back to beginning
	storyIndex = 0
	// reset the finished flag
	twee.setVariable("finished", "false")
}


function stateCardInserted() {
	// ask first question
	changeState("ask");
	// card state flag
	cardIsInserted = true
	showScanner(false)
}

function showScanner(show) {
	document.getElementById('scanner_div').style.display = show ? 'block' : 'none'
}

function stateCardRemoved() {
	// reset story variables
	resetStory()
	// stop speaking, etc
	resetSpeech()
	// go back to waiting mode
	changeState("ready")
	// card state flag
	cardIsInserted = false
	showScanner(true)
}


function stateAsk() {
	// set the question state
	questionState = "asking"
	// ask a question
	twee.goToPassage("State-Ask-" + storyIndex)
}


function stateAsked() {
	// if we're all done
	if (twee.getVariable("finished") == "true") return
	// start recording answer
	speechRecStart()
}


function stateAnswered() {
	// set the question state
	questionState = "answered"
	// show response
	twee.goToPassage("State-Answered-" + storyIndex)
	// stop listening
	speechRecStop()
}


function stateValidate() {
	// set the question state to validating
	questionState = "validating"
	// start recording answer
	speechRecStart()
}


function stateValidated() {
	// set the question state to validating
	questionState = ""
	// what was the answer?
	let answer = twee.getVariable("answer")
	// anything other than a non-yes answer restarts question
	if (!answer.includes("yes")) {
		changeState("ask")
	} else {
		// check to see if we're at the end of the story
		if (twee.getVariable("finished") == "true") changeState("finished")
		// otherwise, move on to next
		else {
			// increment story index
			storyIndex++;
			// ask next question
			changeState("ask")
		}
	}
}


function stateFinished() {
	
}


function stateRandom() {
	// tell Twee to go to the Ready screen
	twee.goToPassage('State-Random')
}
