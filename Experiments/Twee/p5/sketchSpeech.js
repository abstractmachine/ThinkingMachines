// sound variables
let soundIsActivated = false, resetting = false
// speech-to-text & text-to-speech objects
let speech, speechRec
// textToSpeech question
let askingQuestion = false, questionString = "", listening = false, listeningError = false


function setupSpeech() {
	// if we've already setup the audio
	if (soundIsActivated) return
	soundIsActivated = true
	// instantiate the text-to-speech engine of P5
	speech = new p5.Speech()
	speech.onLoad = speechLoaded
	speech.interrupt = true
	// instantiate the speech-to-text engine of P5
	speechRec = new p5.SpeechRec() // speech recognition object (will prompt for mic access)
	speechRec.onResult = speechRecResult // bind callback function to trigger when speech is recognized
	speechRec.onStart = speechRecStarted
	speechRec.onEnd = speechRecEnded
	speechRec.onError = speechRecError
	speechRec.continuous = false
}


// Incoming Speech Recognition functions

function speechRecStart() {
	 // start listening
	speechRec.start()
	// reset listening flags
	listening = true
	listeningError = false
	// tell Twee we're listening (to turn on animation)
	twee.startedListening()
}

// we currently listening
function speechRecStarted() {
	changeState("Listening")
}

// we're done listening
function speechRecStop() {
	// reset listening flags
	listening = false
	// tell Twee we've stopped listening (to turn off animation)
	twee.stoppedListening()
}

// for whatever reason (error, response, etc) we've stopped listening
function speechRecEnded() {
	// if we had a problem
	if (listeningError) {
		// start listening again
		speechRecStart()
		return
	}
	// if should still be listening
	if (listening) {
		// start listening again
		speechRecStart()
		return
	}
	// change state flags to reflect new state
	changeState("StoppedListening")
	listening = false
	// tell Twee we've stopped listening (to turn off animation)
	twee.stoppedListening()
}

function speechRecError() {
	// activate error flag
	listeningError = true
}

// we got a speech result
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
	// console.log(speechRec.resultString) // log the result
	// console.log(speechRec.resultConfidence)
	// console.log(speechRec.resultValue)
	// move to "Answered" state
	changeState("Answered");
	// turn off listening flag
	listening = false
}

// Outgoing Speech functions

// text-to-speech is loaded, configure it
function speechLoaded() {
	// we should be able to interrupt the speech
	speech.interrupt = true
	speech.onStart = speechStarted
	speech.onEnd = speechEnded
	// speech.listVoices()
	speech.setVoice("Google UK English Male")
	// speech.setVoice("Google UK English Female")
	changeState("Ready")
}

function speak(phrase) {
	// if we are currently listening, stop listening
	if (listening) speechRecStop();
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
	if (listening) speechRecStop();
	askingQuestion = true
	questionString = phrase
	twee.setVariable("speechPhrase", questionString)
	speech.speak(questionString)
}

// the robot started speaking
function speechStarted() {
	// if (askingQuestion) changeState("Asking")
	// else changeState("Speaking")
}

// the robot stopped speaking
function speechEnded() {
	// FIXME: this is pretty hacky and is related to speech-still-talking issues
	if (resetting) {
		resetting = false
		return
	}
	// if we were asking a question, let the state machine know we had an answer
	if (askingQuestion) changeState("Asked")
}

// reset all the current speech & flags
function resetSpeech() {
	cancelSpeaking()
	speechRecStop()
	listening = false
	listeningError = false
	askingQuestion = false
	questionString = ""
	resetting = true
}
