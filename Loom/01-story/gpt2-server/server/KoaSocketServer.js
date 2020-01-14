import Koa from 'koa'
import IOServer from 'socket.io'
import handleError from './handleError.js'

export default class KoaSocketServer extends Koa {
  constructor({
    io = new IOServer(),
    protocol = 'http',
    host = '0.0.0.0',
    port = 8000,
  } = {}) {
    super()

    this.config = { protocol, host, port }
    this.server = null

    this.io = io 
    this.io.on('error', err => {
      this.emit('error', err)
    })

    this.use(handleError())
  }

  async start() {
    const { protocol, host, port } = this.config
    this.server = await new Promise((resolve, reject) => {
      const url = `${protocol}://${host}:${port}`
      const server = this.listen(port, host, () => {
        this.io.serveClient(false).attach(server)
        console.log(`Server started at ${url}`)
        resolve(server)
      })
      if (!server) {
        reject(new Error(`Unable to start server at ${url}`))
      }
    })
  }

  async stop() {
    this.server = await new Promise((resolve, reject) => {
      if (this.server) {
        this.server.close(err => {
          if (err) {
            reject(err)
          } else {
            resolve(null)
          }
        })
      } else {
        reject(new Error('Server is not running'))
      }
    })
  }

  async startOrExit() {
    try {
      await this.start()
    } catch (err) {
      console.error(err)
      process.exit(-1)
    }
  }
}
