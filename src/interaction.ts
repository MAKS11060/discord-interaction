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
import {verifyRequestSignature} from './lib/ed25519.ts'
import {
  ApplicationCommandAutocompleteContext,
  ApplicationCommandContext,
  ContextMenuCommandContext,
  MessageComponentContext,
  ModalContext,
} from './context.ts'
import {associateBy, deepMerge} from '@std/collections'
import {Command, Handler, HandlerFn, InitHandler} from './types.ts'

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

const commandsInit = (init: Command[]): InitHandler => {
  const handlers: InitHandler = {}


  for (const {command, handler} of init) {
    // console.log(handler)
    for (const key in handler) {
      handlers[key] ??= {} // init obj
      const l0 = handler[key] // level 0


      if (typeof l0 === 'object') {
        for (const key2 in l0) {
          const l1 = l0[key2] // level 1

          if (typeof l1 === 'object') {
            for (const key3 in l1) {
              const l2 = l1[key3] // level 2
              console.log(l2)
              if (typeof l2 === 'function') {
                // handlers[key][key2][key3] = l2
              }
            }
          }
          // console.log('obj', l1)

          if (typeof l1 === 'function') {
            // console.log(l1)
          }
        }
      }
      if (typeof l0 === 'function') {

        console.log(command)

        handlers[key] = l0({}) as Handler<unknown>

        // handlers[key] = l0({})
        // console.log(l0)
      }
      // console.log('obj', l0)
    }
  }

  // for (const key in init) {
  // if (typeof init[key] === 'function') {
  // handlers[key] = init[key].
  // }
  // }

  return handlers
}

export const createHandler = (commands: Command[]) => {
  /*   let obj: Record<string, any> = {}
  for (const command of commands) {
    obj = deepMerge(obj, command.handler)
  }
  for (const key in obj) {
    // obj[key] = typeof obj[key] === "function" ? obj[key](command)
  }
  console.log(obj) */
  // console.log(commands)
  const obj = commandsInit(commands)
  console.log(obj)

  return async (interaction: APIInteraction): Promise<APIInteractionResponse> => {
    if (interaction.type === InteractionType.Ping) {
      return {type: InteractionResponseType.Pong}
    }

    if (interaction.type === InteractionType.ApplicationCommand) {
      if (interaction.data.type === ApplicationCommandType.ChatInput) {
        const c = new ApplicationCommandContext(obj[interaction.data.name], interaction.data.options)

        if (!interaction.data.options) {
          return obj[interaction.data.name](c)
        } else {
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

      if (interaction.data.type === ApplicationCommandType.User) {
        const c = new ContextMenuCommandContext(obj[interaction.data.name])
        return obj[interaction.data.name](c)
      }

      if (interaction.data.type === ApplicationCommandType.Message) {
        const c = new ContextMenuCommandContext(obj[interaction.data.name])
        return obj[interaction.data.name](c)
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

// export const createHandler2 = (commands: Handler[]) => {
//   const list = commands.map(({command, executor}) => {
//     // return {command, handler: executor(command)}
//   })
//   console.log(commands)

//   return async (interaction: APIInteraction): Promise<APIInteractionResponse> => {
//     if (interaction.type === InteractionType.Ping) {
//       return {type: InteractionResponseType.Pong}
//     }

//     if (interaction.type === InteractionType.ApplicationCommand) {
//       for (const {command, handler} of list) {
//         if (interaction.data.name === command.name) {
//           if (!handler.command) return errorCommand('command handler is undefined')

//           const ctx = new InteractionContext(interaction, command)
//           return await handler.command(ctx)
//         }
//       }
//     }

//     if (interaction.type === InteractionType.MessageComponent) {
//       for (const {command, handler} of list) {
//         if (interaction.message.interaction) {
//           if (interaction.message.interaction.name === command.name) {
//             if (!handler.messageComponent) return errorCommand('messageComponent handler is undefined')

//             const ctx = new InteractionContext(interaction, command)
//             return await handler.messageComponent(ctx)
//           }
//         }
//       }
//     }

//     if (interaction.type === InteractionType.ApplicationCommandAutocomplete) {
//       for (const {command, handler} of list) {
//         if (interaction.data.name === command.name) {
//           if (!handler.commandAutocomplete) return errorCommand('commandAutocomplete handler is undefined')

//           const ctx = new InteractionContext(interaction, command)
//           return await handler.commandAutocomplete(ctx)
//         }
//       }
//     }

//     if (interaction.type === InteractionType.ModalSubmit) {
//       new ModalContext()
//       return errorCommand('no implemented ModalSubmit')
//     }

//     return unknownCommand()
//   }
// }

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
export const discordInteraction = (key: CryptoKey, commands: Command[]) => {
  const handler = createHandler(commands)

  return async (req: Request): Promise<Response> => {
    const invalid = await verifyRequestSignature(req, key)
    if (invalid) return invalid

    return Response.json(await handler(await req.json()))
  }
}
