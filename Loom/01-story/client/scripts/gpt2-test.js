const socket = io()

document.querySelector('#write').addEventListener('click', () => {
  let phrase = '$Hero entered $Place using $MagicalObject and stood there as';
  console.log(phrase)
  socket.emit('gpt2-prompt', phrase)
})

socket.on('gpt2-response', message => {
  console.log(message)
})

socket.on('gpt2-error', message => {
  console.error(message)
})
