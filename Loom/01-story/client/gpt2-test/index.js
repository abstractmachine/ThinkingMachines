const { protocol, hostname, port } = window.location
const socket = io(`${protocol}//${hostname}:${port}`)

document.getElementById('send').addEventListener('click', () => {
  socket.emit('gpt2-prompt', document.getElementById('prompt').value)
})

socket.on('gpt2-response', response => {
  console.log(response)
  document.getElementById('response').value = response
})

socket.on('gpt2-error', error => {
  console.error(error)
})
