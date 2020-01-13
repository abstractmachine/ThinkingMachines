// sound variables
let soundIsActivated = false, resetting = false
// speech-to-text & text-to-speech objects
let speech, speechRec
// textToSpeech question
let askingQuestion = false, questionString = "", listening = false, listeningError = false


function setupSpeech() {

	if (soundIsActivated) return
	soundIsActivated = true

	speech = new p5.Speech()
	speech.onLoad = speechLoaded
	speech.interrupt = true

	speechRec = new p5.SpeechRec() // speech recognition object (will prompt for mic access)
	speechRec.onResult = speechRecResult // bind callback function to trigger when speech is recognized
	speechRec.onStart = speechRecStarted
	speechRec.onEnd = speechRecEnded
	speechRec.onError = speechRecError
	speechRec.continuous = false

}


// Incoming Speech Recognition functions

function speechStartListening() {
	if (listening) {
		console.log("speechRec is already listening!")
		return
	}
	speechRec.start() // start listening
	// reset listening flags
	listening = true
	listeningError = false
}

function speechStopListening() {
	// reset listening flags
	listening = false
}

function speechRecStarted() {
	changeState("Listening")
}

function speechRecEnded() {
	listening = false
	// if we  had a problem
	if (listeningError) {
		// start listening again
		speechStartListening()
		console.log("starting to listen again")
		return
	}

	changeState("StoppedListening")
}

function speechRecError() {
	listeningError = true
}

function speechRecResult() {
	// make sure we still care about the results
	if (!listening) {
		console.log("Received speech but we are no longer listening");
		listening = false
		return;
	}
	// tell twee what the results were of the response
	twee.setVariable("answer", speechRec.resultString)
	// print out value confidence score
	console.log(speechRec.resultString) // log the result
	console.log(speechRec.resultConfidence)
	console.log(speechRec.resultValue)
	// move to "Answered" state
	changeState("Answered");
	// turn off listening flag
	listening = false
}

// Outgoing Speech functions

function speechLoaded() {
	speech.interrupt = false
	speech.onStart = speechStarted
	speech.onEnd = speechEnded
	// speech.listVoices()
	speech.setVoice("Google UK English Male")
	changeState("Ready")
}

function speak(phrase) {
	// if we are currently listening, stop listening
	if (listening) speechStopListening();
	// tell twee what we are saying
	twee.setVariable("phrase", phrase)
	// instructs the synthesizer to speak the string encoded in utterance
	speech.speak(phrase)
}

function cancelSpeaking() {
	twee.setVariable("phrase", "")
	// silently cancels the current utterance and clears any queued utterances
	speech.cancel()
}

function ask(phrase) {
	// if we are currently listening, stop listening
	if (listening) speechStopListening();
	askingQuestion = true
	questionString = phrase
	twee.setVariable("speechPhrase", questionString)
	speech.speak(questionString)
}

function speechStarted() {
	if (askingQuestion) changeState("Asking")
	else changeState("Speaking")
}

function speechEnded() {
	if (resetting) {
		resetting = false
		return
	}
	if (askingQuestion) changeState("Asked")
	else changeState("Spoke")
}

function resetSpeech() {
	cancelSpeaking()
	speechStopListening()
	listening = false
	listeningError = false
	askingQuestion = false
	questionString = ""
	resetting = true
}
