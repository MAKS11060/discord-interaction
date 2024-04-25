import 'https://deno.land/std/dotenv/load.ts'

import {Hono} from 'hono'
import {commands} from './src/commands.ts'
import {discordInteraction} from './src/interaction.ts'
import {importRawKey} from './src/lib/ed25519.ts'

const app = new Hono()
const key = await importRawKey(Deno.env.get('CLIENT_PUBLIC_KEY')!)

app.post('/interaction', ...discordInteraction(key, commands))

if (Deno.env.has('KEY') && Deno.env.has('CERT')) {
  const key = Deno.readTextFileSync(Deno.env.get('KEY')!)
  const cert = Deno.readTextFileSync(Deno.env.get('CERT')!)
  Deno.serve({key, cert, port: 443}, app.fetch)
} else {
  Deno.serve({port: 80}, app.fetch)
}
