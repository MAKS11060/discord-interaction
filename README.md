# discord-interaction [WIP]

<!-- [![JSR][JSR badge]][JSR] -->
[![CI][CI badge]][CI]

<!-- https://jsr.io/docs/badges -->
<!-- [JSR]: https://jsr.io/@maks11060/tmp -->
<!-- [JSR badge]: https://jsr.io/badges/@maks11060/tmp -->
<!-- https://docs.github.com/en/actions/monitoring-and-troubleshooting-workflows/adding-a-workflow-status-badge -->
[CI]: https://github.com/maks11060/discord-interaction/actions/workflows/ci.yml
[CI badge]: https://github.com/maks11060/discord-interaction/actions/workflows/ci.yml/badge.svg

<!--
## Usage

Define commands:
```ts
// commands.ts
import {defineCommand} from '@maks11060/discord-interaction'

const help = defineCommand({}) // TODO

export const commands = [help]
```

### Use [Hono](https://hono.dev)

```ts
import {Hono} from 'hono'
import {importKeyRaw, discordInteraction} from '@maks11060/discord-interaction/hono'
import {commands} from './commands.ts'

const app = new Hono()
const key = await importKeyRaw(Deno.env.get('CLIENT_PUBLIC_KEY')!)

app.post('/interaction', ...discordInteraction(key, /* commands */))

Deno.serve(app.fetch) // Deno
// export default app // Bun/CF worker
// for any runtime https://hono.dev/getting-started/basic
```

### Without framework
```ts
import {importKeyRaw, discordInteraction} from '@maks11060/discord-interaction'
import {commands} from './commands.ts'

const key = await importKeyRaw(Deno.env.get('CLIENT_PUBLIC_KEY')!)
const interaction = discordInteraction(key, /* commands */)

Deno.serve(req => {
  const uri = new URL(req.url)
  if (req.method === 'POST' && uri.pathname === '/interaction') {
    return interaction(req)
  }
  return new Response('404 Not found', {status: 404})
})
```

## Deploy commands
 -->

<!-- TODO
1. Set env `CLIENT_ID` `CLIENT_SECRET`
2. Install CLI
3. CLI -c ./commands.ts -->


<!--
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
