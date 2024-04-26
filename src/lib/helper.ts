import {createMiddleware} from 'hono/factory'

function statusColor(status: number) {
  const code = (status / 100) | 0 // 404 => 4
  if (code === 2) return 'green'
  if (code === 3) return 'yellow'
  if (code === 4) return 'red'
  if (code === 5) return 'red'
  return 'white'
}

export const loggerBody = <T>(options: {
  pad?: number
  logFn?: (data: T) => void
} = {}) => {
  options.pad ??= 0
  options.logFn ??= console.log
  const {pad} = options
  const padFill = ' '

  return createMiddleware(async (c, next) => {
    try {
      if (['GET', 'HEAD'].includes(c.req.method)) return await next()

      const start = performance.now()
      console.log(
        `<-- ${c.req.method.padStart(pad, padFill)} %c${c.req.url}`,
        'color: green'
      )

      c.req.header('content-type') === 'application/json'
        ? options.logFn!(await c.req.raw.clone().json())
        : console.log(await c.req.raw.clone().text())

      await next()
      console.log(
        `--> ${c.req.method.padStart(pad, padFill)} %c${c.res.status} %c${
          c.req.url
        } %c${(performance.now() - start).toFixed(3)} ms`,
        `color: ${statusColor(c.res.status)}`,
        'color: green',
        'color: blue'
      )
      return
    } catch (e) {
      console.error(e)
    }
    await next()
  })
}
