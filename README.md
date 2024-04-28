# discord-interaction [WIP]


```ts
// commands.ts
import {MessageFlags} from 'discord-api-types/v10'
import {defineCommand} from './mod.ts'

const help = defineCommand(
  {
    name: 'help',
    description: 'Show help',
  },
  () => {
    return {
      command(c) {
        return c.reply({content: 'ok', flags: MessageFlags.Ephemeral})
      },
    }
  }
)

export const commands = [help]
```

## Examples

#### `Deno/Hono`
```ts
import {Hono} from 'hono'
import {importKeyRaw, discordInteraction} from './hono.ts'
import {commands} from './commands.ts'

const app = new Hono()
const key = await importKeyRaw(Deno.env.get('CLIENT_PUBLIC_KEY')!)

app.post('/interaction', ...discordInteraction(key, commands))

Deno.serve(app.fetch)
```

#### `Deno` | `CF` | `FetchEvent`
```ts
import {importKeyRaw, discordInteraction} from './mod.ts'

const key = await importKeyRaw(Deno.env.get('CLIENT_PUBLIC_KEY')!)
const interaction = discordInteraction(key, commands)

Deno.serve(req => {
  const uri = new URL(req.url)

  if (req.method === 'POST' && uri.pathname === '/interaction') {
    return interaction(req)
  }

  return new Response('404 Not found', {status: 404})
})
```
