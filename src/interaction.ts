import {
  APIInteraction,
  APIInteractionResponse,
  InteractionResponseType,
  InteractionType,
  MessageFlags,
} from 'discord-api-types/v10'
import {DefineCommand, InteractionContext} from './builder.ts'
import {verifyRequestSignature} from './lib/ed25519.ts'

const unknownCommand = (): APIInteractionResponse => {
  return {
    type: InteractionResponseType.ChannelMessageWithSource,
    data: {
      content: 'Unknown command',
      flags: MessageFlags.Ephemeral,
    },
  }
}

const errorCommand = (text: string): APIInteractionResponse => {
  return {
    type: InteractionResponseType.ChannelMessageWithSource,
    data: {
      content: text,
      flags: MessageFlags.Ephemeral,
    },
  }
}

export const createHandler = <T extends DefineCommand[]>(commands: T) => {
  const list = commands.map(({executor, ...command}) => {
    return {
      command,
      handlers: executor(command),
    }
  })

  return async (interaction: APIInteraction): Promise<APIInteractionResponse> => {
    if (interaction.type === InteractionType.Ping) {
      return {type: InteractionResponseType.Pong}
    }

    if (interaction.type === InteractionType.ApplicationCommand) {
      for (const {command, handlers} of list) {
        if (interaction.data.name === command.name) {
          if (!handlers.command) return errorCommand('command handler is undefined')

          const ctx = new InteractionContext(interaction)
          return await handlers.command(ctx)
        }
      }
    }

    if (interaction.type === InteractionType.MessageComponent) {
      for (const {command, handlers} of list) {
        if (interaction.message.interaction) {
          if (interaction.message.interaction.name === command.name) {
            if (!handlers.messageComponent) return errorCommand('messageComponent handler is undefined')

            const ctx = new InteractionContext(interaction)
            return await handlers.messageComponent(ctx)
          }
        }
      }
    }

    if (interaction.type === InteractionType.ApplicationCommandAutocomplete) {
      for (const {command, handlers} of list) {
        if (interaction.data.name === command.name) {
          if (!handlers.commandAutocomplete) return errorCommand('commandAutocomplete handler is undefined')

          const ctx = new InteractionContext(interaction)
          return await handlers.commandAutocomplete(ctx)
        }
      }
    }

    if (interaction.type === InteractionType.ModalSubmit) {
      return errorCommand('no implemented ModalSubmit')
    }

    return unknownCommand()
  }
}

export const discordInteraction = <T extends DefineCommand[]>(key: CryptoKey, commands: T) => {
  const handler = createHandler(commands)

  return async (req: Request): Promise<Response> => {
    const invalid = await verifyRequestSignature(req, key)
    if (invalid) return invalid

    return Response.json(await handler(await req.json()))
  }
}
