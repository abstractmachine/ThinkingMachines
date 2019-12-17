import serve from 'koa-static'
import mount from 'koa-mount'
import IOServer from 'socket.io'
import KoaSocketServer from './KoaSocketServer.js'

const io = new IOServer()
const server = new KoaSocketServer({ io })

server.use(serve('./client'))
// Server the web-modules, built by Pika
server.use(mount('/web_modules', serve('./web_modules')))

io.on('connect', socket => {
  socket.on('hello', message => {
    console.log('Socket', socket.id, 'said hello:', message)
    socket.emit('hello', 'Hello back!')
    socket.broadcast.emit('new-client', `Socket ${socket.id} has joined!`)
  })
})

server.startOrExit()
