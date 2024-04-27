import {
  APIInteraction,
  APIInteractionResponse,
  InteractionResponseType,
  InteractionType,
  MessageFlags
} from 'discord-api-types/v10'
import {createFactory, createMiddleware} from 'hono/factory'
import {DefineCommand, InteractionContext} from './builder.ts'
import {verifyRequestSignature} from './lib/ed25519.ts'
import {loggerBody} from './lib/helper.ts'

/*
[discord] --> [Server]
            verify request
          handle interaction

const c = defineCommand()
const handler = c.execute() // init command
handler(interaction)
 */

const unknownCommand = () => {
  const r: APIInteractionResponse = {
    type: InteractionResponseType.ChannelMessageWithSource,
    data: {
      content: 'Unknown command',
      flags: MessageFlags.Ephemeral,
    },
  }
  return Response.json(r)
}

const errorCommand = (text: string) => {
  const r: APIInteractionResponse = {
    type: InteractionResponseType.ChannelMessageWithSource,
    data: {
      content: text,
      flags: MessageFlags.Ephemeral,
    },
  }
  return Response.json(r)
}

export const discordInteraction = <T extends DefineCommand[]>(key: CryptoKey, commands: T) => {
  // prepare
  const list = commands.map(({executor, ...command}) => {
    return {
      command,
      handlers: executor(command),
    }
  })

  const interactionHandler = createMiddleware(async (c) => {
    const interaction = await c.req.json<APIInteraction>()

    if (interaction.type === InteractionType.Ping) {
      return Response.json({
        type: InteractionResponseType.Pong,
      } as APIInteractionResponse)
    }

    if (interaction.type === InteractionType.ApplicationCommand) {
      for (const {command, handlers} of list) {
        if (interaction.data.name === command.name) {
          if (!handlers.command) return errorCommand('command handler is undefined')

          const ctx = new InteractionContext(interaction)
          return c.json(await handlers.command(ctx))
        }
      }
    }

    if (interaction.type === InteractionType.MessageComponent) {
      for (const {command, handlers} of list) {
        if (interaction.message.interaction) {
          if (interaction.message.interaction.name === command.name) {
            if (!handlers.messageComponent) return errorCommand('messageComponent handler is undefined')

            const ctx = new InteractionContext(interaction)
            return c.json(await handlers.messageComponent(ctx))
          }
        }
      }
    }

    if (interaction.type === InteractionType.ApplicationCommandAutocomplete) {
      for (const {command, handlers} of list) {
        if (interaction.data.name === command.name) {
          if (!handlers.commandAutocomplete) return errorCommand('commandAutocomplete handler is undefined')

          const ctx = new InteractionContext(interaction)
          return c.json(await handlers.commandAutocomplete(ctx))
        }
      }
    }

    if (interaction.type === InteractionType.ModalSubmit) {
      return errorCommand('no implemented ModalSubmit')
    }

    return unknownCommand()
  })

  return createFactory().createHandlers(
    verifyRequestSignature(key),
    loggerBody<APIInteraction>({
      logFn: ({type, data, member, channel, ...int}) => {
        console.log('channel', channel?.id, channel?.name, '| member', member?.user.id, member?.user.global_name)
        console.log(int)
        console.log(InteractionType[type], data)
      },
    }),
    interactionHandler
  )
}
