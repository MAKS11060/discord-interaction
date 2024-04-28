import 'https://deno.land/std/dotenv/load.ts'

import {Hono} from 'hono'
import discord from './discord.ts'

const app = new Hono()

app.route('/', discord)

if (Deno.env.has('KEY') && Deno.env.has('CERT')) {
  const key = Deno.readTextFileSync(Deno.env.get('KEY')!)
  const cert = Deno.readTextFileSync(Deno.env.get('CERT')!)
  Deno.serve({key, cert, port: 443}, app.fetch)
} else {
  Deno.serve({port: 80}, app.fetch)
}
