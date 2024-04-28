import {APIInteraction, InteractionType} from 'discord-api-types/v10'
import {Hono} from 'hono'
import {discordInteraction} from './src/adapter/hono.ts'

import {commands} from './src/commands.ts'
import {importKeyRaw} from './mod.ts'
import {loggerBody} from './src/lib/helper.ts'


const key = await importKeyRaw(Deno.env.get('CLIENT_PUBLIC_KEY')!)
const app = new Hono().post(
  '/interaction',
  loggerBody<APIInteraction>({
    logFn: ({type, data, member, channel, ...int}) => {
      console.log('channel', channel?.id, channel?.name, '| member', member?.user.id, member?.user.global_name)
      console.log(int)
      console.log(InteractionType[type], data)
    },
  }),
  ...discordInteraction(key, commands)
)

export default app
