# discord-interaction [WIP]

<!-- [![JSR][JSR badge]][JSR] -->
[![CI][CI badge]][CI]

<!-- https://jsr.io/docs/badges -->
<!-- [JSR]: https://jsr.io/@maks11060/tmp -->
<!-- [JSR badge]: https://jsr.io/badges/@maks11060/tmp -->
[CI]: https://github.com/maks11060/discord-interaction/actions/workflows/ci.yml
[CI badge]: https://github.com/maks11060/discord-interaction/actions/workflows/ci.yml/badge.svg

### Library for handling **Discord Interaction**.
Handle slash command, user and chat command.

## Quick Start

1. Create an application on [Discord dev](https://discord.com/developers/applications)
2. Add **Application** to your server:
   - Replace `client_id` with yours
   - https://discord.com/oauth2/authorize?client_id=0123456789012345678
3. Copy `PUBLIC KEY` to .env
4. Copy `CLIENT_ID` and `CLIENT_SECRET` from OAuth2 page

### `.env` file:
```env
# Discord https://discord.com/developers/applications
# CLIENT_ID=        # Only for deploying commands
# CLIENT_SECRET=    # Only for deploying commands
CLIENT_PUBLIC_KEY=  # Application public key
```

## Install CLI
```ps
deno install -Arfg -n deploy-discord jsr:@maks11060/discord-interaction/cli
```

## Usage

Define commands:
```ts
// commands.ts
import {defineCommand, format} from '@maks11060/discord-interaction'

const hello = defineCommand({
  name: 'hello',
  description: 'says hi',
}).createHandler({
  hello: () => {
    return {
      command: (c) => {
        return c.reply({
          content: `Hello ${format.user(c.user.id)}`
        })
      },
    }
  },
})

export const commands = [hello]
```

### Use [Hono](https://hono.dev)

```ts
import {Hono} from 'hono'
import {importKeyRaw, discordInteraction} from '@maks11060/discord-interaction/hono'
import {commands} from './commands.ts'

const app = new Hono()
const key = await importKeyRaw(Deno.env.get('CLIENT_PUBLIC_KEY')!)

app.post('/interaction', ...discordInteraction(key, commands))

Deno.serve(app.fetch)
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

## TODO
  - [x] ApplicationCommandContext
    - [x] getter for options
    - [x] reply/replyUpdate
    - [ ] deferredReply/deferredReplyUpdate
  - [x] ApplicationCommandAutocompleteContext
    - [ ] deferredReply/deferredReplyUpdate
  - [x] MessageComponentContext
    - [ ] deferredReply
  - [x] ModalContext
    - [ ] deferredReply
  - [x] ContextMenuCommandContext
