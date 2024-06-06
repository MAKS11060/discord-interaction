#!/usr/bin/env -S deno run -A --watch
import '@std/dotenv/load'

import {Hono} from 'hono'
import {APIInteraction, APIInteractionResponse, InteractionType} from 'discord-api-types/v10'
import {commands} from './examples/command.ts'
import {importKeyRaw, discordInteraction} from './src/adapter/hono.ts'
import {loggerBody} from 'https://raw.githubusercontent.com/MAKS11060/deno-libs/main/hono/loggerBody.ts'

const key = await importKeyRaw(Deno.env.get('CLIENT_PUBLIC_KEY')!)
const app = new Hono().post(
  '/interaction',
  loggerBody<APIInteraction, APIInteractionResponse>({
    incoming: ({type, data, member, channel, ...int}) => {
      console.log('channel', channel?.id, channel?.name, '| member', member?.user.id, member?.user.global_name)
      console.log(InteractionType[type], data)
      // console.log(int)
    },
    outgoing: (data) => {
      console.log('outgoing ///////////////////////////////////////////')
      console.log(data)
    },
  }),
  ...discordInteraction(key, commands)
)

if (Deno.env.has('KEY') && Deno.env.has('CERT')) {
  const key = Deno.readTextFileSync(Deno.env.get('KEY')!)
  const cert = Deno.readTextFileSync(Deno.env.get('CERT')!)
  Deno.serve({key, cert, port: 443}, app.fetch)
} else {
  Deno.serve({port: 80}, app.fetch)
}

app.get('/', (c) => {
  return c.text('12')
})
