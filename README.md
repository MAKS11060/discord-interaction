<h1 align="center">Discord Interactions</h1>
<div align="center">
  <a href="https://jsr.io/@maks11060/discord-interactions">
    <img src="https://jsr.io/badges/@maks11060/discord-interactions">
  </a>
  <a href="https://github.com/MAKS11060/discord-interactions/actions/workflows/ci.yml">
    <img src="https://github.com/MAKS11060/discord-interactions/actions/workflows/ci.yml/badge.svg">
  </a>
</div>


### Library for handling **Discord Interactions**.
Handle slash command, user and chat command. [Overview of Interactions](https://discord.com/developers/docs/interactions/overview)

## Quick Start

1. Create a new application on the [Discord Developer Portal](https://discord.com/developers/applications).
2. Add your application to your Discord server by visiting the following URL and replacing `your_client_id` with your actual client ID:
   - `https://discord.com/oauth2/authorize?client_id=your_client_id`
3. Copy the `PUBLIC KEY` from your application's settings page and add it to your `.env` file.
4. Copy the `CLIENT_ID` and `CLIENT_SECRET` from the OAuth2 page of your application's settings and add them to your `.env` file.

### `.env` file:
```
# Discord application settings
# CLIENT_ID=        # Required for deploying commands
# CLIENT_SECRET=    # Required for deploying commands
CLIENT_PUBLIC_KEY=  # Required for verifying requests
```

## Install CLI
```ps
deno install -Arfg -n deploy-discord jsr:@maks11060/discord-interactions/cli
```

## Usage

Define commands:
```ts
// commands.ts
import {defineCommand, format} from '@maks11060/discord-interactions'

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
import {importKeyRaw, discordInteraction} from '@maks11060/discord-interactions/hono'
import {commands} from './commands.ts'

const app = new Hono()
const key = await importKeyRaw(Deno.env.get('CLIENT_PUBLIC_KEY')!)

app.post('/interaction', ...await discordInteraction(key, commands))

Deno.serve(app.fetch)
```

### Without framework
```ts
import {importKeyRaw, discordInteraction} from '@maks11060/discord-interactions'
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
