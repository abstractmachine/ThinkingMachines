import io from './web_modules/socket.io-client/dist/socket.io.js'

const { protocol, hostname, port } = window.location
const socket = io(`${protocol}//${hostname}:${port}`)

document.querySelector('#write').addEventListener('click', () => {
  socket.emit('prompt', 'Hello World')
})

socket.on('response', message => {
  console.log(message)
})

socket.on('gpt2-error', message => {
  console.error(message)
})
