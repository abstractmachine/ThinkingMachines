const socket = io()

// document.querySelector('#write').addEventListener('click', () => {
//   socket.emit('gpt2-prompt', 'Hello World')
// })

socket.on('gpt2-response', message => {
  console.log(message)
})

socket.on('gpt2-error', message => {
  console.error(message)
})

window.sendPrompt = function(phrase) {
  socket.emit('gpt2-prompt', phrase)
}