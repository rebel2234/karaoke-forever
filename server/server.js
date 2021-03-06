const sqlite = require('sqlite')
const log = require('debug')(`app:server [${process.pid}]`)
const path = require('path')
const webpack = require('webpack')
const webpackConfig = require('../webpack.config')
const project = require('../project.config')

const http = require('http')
const fs = require('fs')
const { promisify } = require('util')
const parseCookie = require('./lib/parseCookie')
const jwtVerify = require('jsonwebtoken').verify
const Koa = require('koa')
const KoaBodyparser = require('koa-bodyparser')
const KoaRange = require('koa-range')
const KoaLogger = require('koa-logger')
const KoaWebpack = require('koa-webpack')
const KoaStatic = require('koa-static')
const app = new Koa()

const libraryRouter = require('./Library/router')
const mediaRouter = require('./Media/router')
const prefsRouter = require('./Prefs/router')
const roomsRouter = require('./Rooms/router')
const userRouter = require('./User/router')

const SocketIO = require('socket.io')
const socketActions = require('./socket')

module.exports = function () {
  const dbFile = path.resolve(project.basePath, 'database.sqlite3')
  log('Opening database file %s', dbFile)

  Promise.resolve()
    .then(() => sqlite.open(dbFile, { Promise }))
    .then(db => db.migrate({
      migrationsPath: path.resolve('server', 'lib', 'db'),
      // force: 'last' ,
    }))

  app.use(KoaLogger())
  app.use(KoaRange)
  app.use(KoaBodyparser())

  // all http (koa) requests
  app.use(async (ctx, next) => {
    ctx.io = io

    // make JWT data available on ctx
    const { id_token } = parseCookie(ctx.request.header.cookie)

    try {
      ctx.user = jwtVerify(id_token, 'shared-secret')
    } catch (err) {
      ctx.user = {
        userId: null,
        username: null,
        name: null,
        isAdmin: false,
        roomId: null,
      }
    }

    await next()
  })

  // http api (koa-router) endpoints
  app.use(libraryRouter.routes())
  app.use(mediaRouter.routes())
  app.use(prefsRouter.routes())
  app.use(roomsRouter.routes())
  app.use(userRouter.routes())

  if (project.env === 'development') {
    // development mode

    const compiler = webpack(webpackConfig)
    log('Enabling webpack dev and HMR middleware')

    app.use(KoaWebpack({
      compiler,
      dev: {
        stats       : 'minimal',
      },
    }))

    // serve static assets from ~/public since Webpack is unaware of these
    app.use(KoaStatic(path.resolve(project.basePath, 'public')))

    // "rewrite" other requests to the root /index.html file
    // (which webpack-dev-server will serve from a virtual ~/dist)
    const indexFile = path.join(project.basePath, 'dist', 'index.html')

    app.use(async (ctx, next) => {
      try {
        ctx.body = await new Promise(function (resolve, reject) {
          compiler.outputFileSystem.readFile(indexFile, (err, result) => {
            if (err) { return reject(err) }
            return resolve(result)
          })
        })
        ctx.set('content-type', 'text/html')
        ctx.status = 200
      } catch (err) {
        return Promise.reject(err)
      }
    })
  } else {
    // production mode

    // serve files in ~/dist
    app.use(KoaStatic(path.resolve(project.basePath, 'dist')))

    // "rewrite" all other requests to the root /index.html file
    const indexFile = path.join(project.basePath, 'dist', 'index.html')
    const readFile = promisify(fs.readFile)

    app.use(async (ctx, next) => {
      try {
        ctx.body = await readFile(indexFile)
        ctx.set('content-type', 'text/html')
        ctx.status = 200
      } catch (err) {
        return Promise.reject(err)
      }
    })
  }

  // start koa and socket.io server
  const server = http.createServer(app.callback())
  const io = new SocketIO(server)

  // attach socket.io event handlers
  socketActions(io)

  // emit messages from scanner over socket.io
  process.on('message', function (action) {
    io.emit('action', action)
  })

  server.listen(project.serverPort)
  log(`Server listening on port ${project.serverPort}`)
}
