import serve from 'koa-static'
import mount from 'koa-mount'
import IOServer from 'socket.io'
import KoaSocketServer from './KoaSocketServer.js'
import { spawn } from 'child_process'

const io = new IOServer()
const server = new KoaSocketServer({ io, host: '127.0.0.1' })

server.use(serve('./client', {
  setHeaders(res) {
    res.setHeader('Feature-Policy', `camera 'self'`)
  }
}))

let gpt2Ready = false
let gpt2Socket = null
const gpt2 = spawn('python3',  [
    'src/interactive_conditional_samples.py',
    '--model_name', 'folk',
    '--top_k', 40,
    '--temperature', 0.8,
    '--length', 100
  ], {
    cwd: './gpt2'
})

gpt2.stdin.setEncoding('utf8')
gpt2.stdout.setEncoding('utf8')

gpt2.stdout.on('data', data => {
  if (/^Model prompt >>>/.test(data)) {
    if (!gpt2Ready) {
      gpt2Ready = true
      console.log('GPT-2 is ready!')
    }
  } else if (gpt2Socket) {
    let text = ''

    try {
    text = data.match(/={20,} SAMPLE 1 ={20,}([\s\S]*?)={20,}/)[1].trim()
    } catch {

    } finally {}

    console.log('gpt2-response:', text)
    gpt2Socket.emit('gpt2-response', text)
    gpt2Socket = null
  }
})

gpt2.on('close', code => {
  console.error('GPT-2 stopped running. Exit code ' + code);
});

io.on('connect', socket => {
  socket.on('gpt2-prompt', message => {
    if (gpt2Ready) {
      if (gpt2Socket) {
        socket.emit('gpt2-error', 'Still waiting.')
      } else {
        console.log('gpt2-prompt:', message)
        gpt2.stdin.write(`${message}\n`)
        gpt2Socket = socket
      }
    } else {
      socket.emit('gpt2-error', 'GPT-2 is not ready.')
    }
  })
  socket.on('disconnect', () => {
    if (gpt2Socket === socket) {
      gpt2Socket = null
    }
  })
})

server.startOrExit()
