import {
  APIApplicationCommandAutocompleteResponse,
  APICommandAutocompleteInteractionResponseCallbackData,
  APIInteraction,
  APIInteractionResponse,
  APIInteractionResponseCallbackData,
  APIInteractionResponseChannelMessageWithSource,
  APIInteractionResponseUpdateMessage,
  APIModalActionRowComponent,
  ApplicationCommandOptionType,
  ApplicationCommandType,
  ComponentType,
  InteractionResponseType,
  InteractionType,
  MessageFlags,
  TextInputStyle,
} from 'discord-api-types/v10'
import {Handler} from './builder.ts'
import {verifyRequestSignature} from './lib/ed25519.ts'
import {InteractionContext} from './builder0.ts'
import {
  ApplicationCommandAutocompleteContext,
  ApplicationCommandContext,
  MessageComponentContext,
  ModalContext,
} from './context.ts'
import {deepMerge} from 'jsr:@std/collections'

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

{
}
export const createHandler = (commands: Handler[]) => {
  let obj = {}

  for (const command of commands) {
    obj = deepMerge(obj, command.handler)
  }
  console.log(obj)

  return async (interaction: APIInteraction): Promise<APIInteractionResponse> => {
    if (interaction.type === InteractionType.Ping) {
      return {type: InteractionResponseType.Pong}
    }

    if (interaction.type === InteractionType.ApplicationCommand) {
      const c = new ApplicationCommandContext()

      if (interaction.data.type === ApplicationCommandType.ChatInput) {
        if (!interaction.data.options) {
          return obj[interaction.data.name](c)
        }

        if (interaction.data.options) {
          for (const option of interaction.data.options) {
            if (option.type === ApplicationCommandOptionType.Subcommand) {
              return obj[interaction.data.name][option.name](c)
            }

            if (option.type === ApplicationCommandOptionType.SubcommandGroup) {
              for (const subOption of option.options) {
                if (subOption.type === ApplicationCommandOptionType.Subcommand) {
                  return obj[interaction.data.name][option.name][subOption.name](c)
                }
              }
            }
          }
        }
      }
    }

    if (interaction.type === InteractionType.MessageComponent) {
      const c = new MessageComponentContext()
    }

    if (interaction.type === InteractionType.ApplicationCommandAutocomplete) {
      const c = new ApplicationCommandAutocompleteContext()
    }

    if (interaction.type === InteractionType.ModalSubmit) {
      const c = new ModalContext()
    }

    return unknownCommand()
  }
}

export const createHandler2 = (commands: Handler[]) => {
  const list = commands.map(({command, executor}) => {
    // return {command, handler: executor(command)}
  })
  console.log(commands)

  return async (interaction: APIInteraction): Promise<APIInteractionResponse> => {
    if (interaction.type === InteractionType.Ping) {
      return {type: InteractionResponseType.Pong}
    }

    if (interaction.type === InteractionType.ApplicationCommand) {
      for (const {command, handler} of list) {
        if (interaction.data.name === command.name) {
          if (!handler.command) return errorCommand('command handler is undefined')

          const ctx = new InteractionContext(interaction, command)
          return await handler.command(ctx)
        }
      }
    }

    if (interaction.type === InteractionType.MessageComponent) {
      for (const {command, handler} of list) {
        if (interaction.message.interaction) {
          if (interaction.message.interaction.name === command.name) {
            if (!handler.messageComponent) return errorCommand('messageComponent handler is undefined')

            const ctx = new InteractionContext(interaction, command)
            return await handler.messageComponent(ctx)
          }
        }
      }
    }

    if (interaction.type === InteractionType.ApplicationCommandAutocomplete) {
      for (const {command, handler} of list) {
        if (interaction.data.name === command.name) {
          if (!handler.commandAutocomplete) return errorCommand('commandAutocomplete handler is undefined')

          const ctx = new InteractionContext(interaction, command)
          return await handler.commandAutocomplete(ctx)
        }
      }
    }

    if (interaction.type === InteractionType.ModalSubmit) {
      new ModalContext()
      return errorCommand('no implemented ModalSubmit')
    }

    return unknownCommand()
  }
}

/**
 * Discord
 *
 * @example
 * ```ts
 * import {importKeyRaw, discordInteraction} from '@maks11060/discord-interaction'
 * import {commands} from './commands.ts'
 *
 * const key = await importKeyRaw(Deno.env.get('CLIENT_PUBLIC_KEY')!)
 * const interaction = discordInteraction(key, [])
 *
 * Deno.serve(req => {
 *   const uri = new URL(req.url)
 *   if (req.method === 'POST' && uri.pathname === '/interaction') {
 *     return interaction(req)
 *   }
 *   return new Response('404 Not found', {status: 404})
 * })
 * ```
 */
export const discordInteraction = (key: CryptoKey, commands: Handler[]) => {
  const handler = createHandler(commands)

  return async (req: Request): Promise<Response> => {
    const invalid = await verifyRequestSignature(req, key)
    if (invalid) return invalid

    return Response.json(await handler(await req.json()))
  }
}
