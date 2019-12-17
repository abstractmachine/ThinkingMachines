import io from './web_modules/socket.io-client/dist/socket.io.js'

const { protocol, hostname, port } = window.location
const socket = io(`${protocol}//${hostname}:${port}`)

socket.on('hello', message => {
  console.log('Server said hello back:', message)
})

socket.on('new-client', message => {
  console.log('Another client connected:', message)
})

console.log('Emitting a hello to the server')
socket.emit('hello', 'Hi there, server')
