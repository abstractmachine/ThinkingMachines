import Koa from 'koa'
import handleError from './handleError.js'

export default class KoaServer extends Koa {
  constructor(config = {
    protocol: 'http',
    host: '0.0.0.0',
    port: 8000
  }) {
    super()

    this.config = config
    this.server = null

    this.use(handleError())
  }

  async start() {
    const { protocol, host, port } = this.config
    this.server = await new Promise((resolve, reject) => {
      const url = `${protocol}://${host}:${port}`
      const server = this.listen(port, host, () => {
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
