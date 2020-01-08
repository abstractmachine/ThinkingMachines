let soundActivated = false;
let speechReady = false;
let speech;
let recognition;

function setup() {
	noCanvas();
}

function startSound() {

	if (soundActivated) return;
	soundActivated = true;

	speech = new p5.Speech();
	speech.onLoad = speechLoaded;

	recognition = new p5.SpeechRec(); // speech recognition object (will prompt for mic access)
	recognition.onResult = recognitionResult; // bind callback function to trigger when speech is recognized
	recognition.onStart = recognitionStart;
	recognition.onEnd = recognitionEnd;
	recognition.onError = recognitionError;
	recognition.continuous = true;
	recognition.start(); // start listening

}

function recognitionStart() {
	console.log("recognitionStart");
}

function recognitionEnd() {
	console.log("recognitionEnd");
}

function recognitionError() {
	console.log("recognitionError");
}

function recognitionResult() {
	console.log(recognition.resultString); // log the result
	console.log(recognition.resultConfidence);
	console.log(recognition.resultValue);
}

function speechLoaded() {
	console.log("Speech Loaded");
	speech.interrupt = true;
	speech.onStart = speechStarted;
	speech.onEnd = speechEnded;
	// speech.listVoices();
	speech.setVoice("Google UK English Male");
	speak("Ready");
}

function speak(phrase) {
	speech.speak(phrase);
	speechReady = true;
}

function speechStarted() {
	console.log("Speech Started");
}

function speechEnded() {
	console.log("Speech Ended");
}