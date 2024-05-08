import {Hono} from 'hono'

const app = new Hono()

export default {
  fetch(req: Request) {

    return app.fetch(req)
  }
}

