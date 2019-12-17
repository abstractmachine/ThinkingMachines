export default function handleError() {
  return async (ctx, next) => {
    try {
      await next()
    } catch (err) {
      ctx.status = err.status || 500
      ctx.body = err.toString()
      ctx.app.emit('error', err, ctx)
    }
  }
}
