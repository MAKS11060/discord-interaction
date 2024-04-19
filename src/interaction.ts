import {createFactory, createMiddleware} from 'hono/factory'
import {
  APIInteraction,
  APIInteractionResponse,
  ApplicationCommandType,
  InteractionResponseType,
  InteractionType,
  MessageFlags,
} from 'npm:discord-api-types/v10'
import {verifyRequestSignature} from './lib/ed25519.ts'

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

const factory = createFactory()

export const discordInteraction = (key: CryptoKey) => {
  const handler = createMiddleware(async (c, next) => {
    const interaction = await c.req.json<APIInteraction>()

    if (interaction.type === InteractionType.Ping) {
      return Response.json({
        type: InteractionResponseType.Pong,
      } as APIInteractionResponse)
    }

    if (interaction.type === InteractionType.ApplicationCommand) {
      if (interaction.data.type === ApplicationCommandType.ChatInput)
      return Response.json({
        type: InteractionResponseType.ChannelMessageWithSource,
        data: {
          content: 'ok',
          flags: MessageFlags.Ephemeral,
        },
      } as APIInteractionResponse)
    }

    return unknownCommand()
  })

  return factory.createHandlers(verifyRequestSignature(key), handler)
}
