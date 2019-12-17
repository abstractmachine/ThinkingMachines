import serve from 'koa-static'
import KoaServer from './KoaServer.js'

const server = new KoaServer()

server.use(serve('./client'))

server.startOrExit()
