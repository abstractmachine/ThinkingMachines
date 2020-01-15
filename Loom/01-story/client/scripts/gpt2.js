const socket = io()

let gptPrompts = []
let gptResults = []
let replacements = {}

socket.on('gpt2-response', message => {

  // add result to gptResults
  gptResults.push(message)
  // send the next one
  sendNextPrompt();

})


socket.on('gpt2-error', message => {

  console.error("gpt2-error", message)

})


window.defineReplacement = function(replacementKey, replacementValue) {

  replacements[replacementKey] = replacementValue;

}


window.resetGenerator = function() {

  gptPrompts = []
  gptResults = []

  replacements = {} // "$Hero": "$StoryHero", "$Donor": "$StoryDonor", "$MagicalObject": "$StoryMagicalObject", "$Helper": "$StoryHelper", "$Villain": "$StoryVillain", "$Prince": "$StoryPrince", "$Place": "$StoryPlace"

}


window.generatorAddPrompt = function(prompt) {

  gptPrompts.push(prompt)

}


window.generateStory = function() {

  sendNextPrompt();

}


window.sendNextPrompt = function() {

  if (gptPrompts.length == 0) {

    generationDone()
  
  } else {
    // get the first item
    let nextPrompt = gptPrompts[0]
    // include it in the list of results
    gptResults.push(nextPrompt)
    // remove that item from array
    gptPrompts.splice(0,1)
    // send that to gpt
    socket.emit('gpt2-prompt', nextPrompt)
  }

  
}


window.generationDone = function() {

  parseResults();

  let story = gptResults.join(" ")
  console.log(story)

  // socket.emit('story', story)

  changeState("ready")

}


window.parseResults = function() {

  // filter out backticks
  for(let j=0; j<gptResults.length; j++) {
    if (gptResults[j] == null) continue;
      gptResults[j] = gptResults[j].replace(/`/g, '')
  }

  // go through each possible replacement
  for (var k in replacements) {
    // go through each result
    for(let j=0; j<gptResults.length; j++) {

      if (gptResults[j] == null) continue;
      gptResults[j] = gptResults[j].split(k).join(replacements[k])

    }
  }

  // remove the dangling part after the last period
  // go through each result
  for(let j=0; j<gptResults.length; j++) {
    if (gptResults[j] == null) continue;
     gptResults[j] = gptResults[j].substr(0, gptResults[j].lastIndexOf("\.")+1);
  }

  for(let j=0; j<gptResults.length; j++) {
    // console.log(gptResults[j])
 }

}