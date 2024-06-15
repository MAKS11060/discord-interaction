import {
  APIApplicationCommandAutocompleteResponse,
  APIApplicationCommandOption,
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
  RESTPostAPIApplicationCommandsJSONBody,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  RESTPostAPIContextMenuApplicationCommandsJSONBody,
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
import {associateBy} from '@std/collections'
import {Command, DefineHandler} from './types.ts'
import {commandSchema, userCommandSchema} from './schema.ts'

const unknownCommand = (text?: string): APIInteractionResponse => {
  return {
    type: InteractionResponseType.ChannelMessageWithSource,
    data: {
      content: text ?? 'Unknown command',
      flags: MessageFlags.Ephemeral,
    },
  }
}

const commandToAct = (command: RESTPostAPIApplicationCommandsJSONBody) => {
  const out: Record<string, any> = {}

  // out[command.name] ??= command // def
  out[command.name] ??= {} // def
  if (command.options) {
    out[command.name] = associateBy(command.options, (v) => v.name)

    for (const key in out[command.name]) {
      if (out[command.name][key].options) {
        // out[command.name][key] ??= out
        out[command.name][key] = associateBy(
          out[command.name][key].options as APIApplicationCommandOption[],
          (v) => v.name
        )

        for (const key2 in out[command.name][key]) {
          if (out[command.name][key][key2].options) {
            // out[command.name][key][key2] ??= {}
            out[command.name][key][key2] = associateBy(
              out[command.name][key][key2].options as APIApplicationCommandOption[],
              (v) => v.name
            )
          }
        }
      }
    }
  }
  // console.log(out)
  return out
}

const commandsInit = async (init: Command[]) => {
  const out: Record<string, any> = {}

  for (const {command, handler} of init) {
    const cAct = commandToAct(command) // to pretty obj
    // console.log(cAct)

    for (const key in handler) {
      const l0 = handler[key]
      if (typeof l0 === 'function') {
        // out[key] = await l0()
        out[key] = await l0(cAct[key])
      }
      if (typeof l0 === 'object') {
        out[key] ??= {}
        for (const key2 in l0) {
          const l1 = l0[key2]
          if (typeof l1 === 'function') {
            // out[key][key2] = await l1()
            out[key][key2] = await l1(cAct[key][key2])
          }
          if (typeof l1 === 'object') {
            out[key][key2] ??= {}
            for (const key3 in l1) {
              const l2 = l1[key3]
              if (typeof l2 === 'function') {
                // out[key][key2][key3] = await l2()
                out[key][key2][key3] = await l2(cAct[key][key2][key3])
              }
            }
          }
        }
      }
    }
  }

  // console.log(out)
  return out
}

export const createHandler = async (commands: Command[]) => {
  const obj = (await commandsInit(commands)) as any
  // console.log(obj)

  return async (interaction: APIInteraction): Promise<APIInteractionResponse> => {
    if (interaction.type === InteractionType.Ping) {
      return {type: InteractionResponseType.Pong}
    }

    if (interaction.type === InteractionType.ApplicationCommand) {
      if (interaction.data.type === ApplicationCommandType.ChatInput) {
        const c = new ApplicationCommandContext(
          interaction,
          obj[interaction.data.name],
          interaction.data.options as any
        )

        if (!interaction.data.options) {
          return obj[interaction.data.name]?.command(c) ?? unknownCommand('command handler is undefined')
        } else {
          for (const option of interaction.data.options) {
            if (option.type === ApplicationCommandOptionType.Subcommand) {
              return (
                obj[interaction.data.name][option.name]?.command(c) ?? unknownCommand('command handler is undefined')
              )
            }

            if (option.type === ApplicationCommandOptionType.SubcommandGroup) {
              for (const subOption of option.options) {
                if (subOption.type === ApplicationCommandOptionType.Subcommand) {
                  return (
                    obj[interaction.data.name][option.name][subOption.name]?.command(c) ??
                    unknownCommand('command handler is undefined')
                  )
                }
              }
            }
          }
        }
      }

      if (interaction.data.type === ApplicationCommandType.User) {
        const c = new ContextMenuCommandContext(obj[interaction.data.name])
        return obj[interaction.data.name]?.command(c) ?? unknownCommand('command handler is undefined')
      }

      if (interaction.data.type === ApplicationCommandType.Message) {
        const c = new ContextMenuCommandContext(obj[interaction.data.name])
        return obj[interaction.data.name]?.command(c) ?? unknownCommand('command handler is undefined')
      }
    }

    if (interaction.type === InteractionType.MessageComponent) {
      // find path
      if (interaction.message.interaction_metadata) {
        if (interaction.message.interaction_metadata.type === InteractionType.ApplicationCommand) {
          const name = interaction.message.interaction_metadata?.name as string
          if (!name) return unknownCommand('Message Component interaction_metadata.name is undefined')

          const c = new MessageComponentContext()
          const keys = name.split(' ', 3) // 'cmd sub-group sub'

          if (keys.length === 1) {
            return obj[keys[0]]?.messageComponent(c) ?? unknownCommand('messageComponent handler is undefined')
          } else if (keys.length === 2) {
            return obj[keys[0]][keys[1]]?.messageComponent(c) ?? unknownCommand('messageComponent handler is undefined')
          } else if (keys.length === 3) {
            return (
              obj[keys[0]][keys[1]][keys[2]]?.messageComponent(c) ??
              unknownCommand('messageComponent handler is undefined')
            )
          }
        }
      }

      const c = new MessageComponentContext()
      // console.log(interaction)
      console.log(interaction.message.interaction_metadata)

      // obj[interaction.message]?.messageComponent(c)

      return unknownCommand('messageComponent handler is undefined')
    }

    if (interaction.type === InteractionType.ApplicationCommandAutocomplete) {
      const c = new ApplicationCommandAutocompleteContext()
      return unknownCommand('commandAutocomplete handler is undefined')
    }

    if (interaction.type === InteractionType.ModalSubmit) {
      const c = new ModalContext()
      return unknownCommand('modalSubmit handler is undefined')
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
 * Example built on web standards
 *
 * @example
 * ```ts
 * import {importKeyRaw, discordInteraction} from '@maks11060/discord-interaction'
 * import {commands} from './commands.ts'
 *
 * const key = await importKeyRaw(Deno.env.get('CLIENT_PUBLIC_KEY')!)
 * const interaction = await discordInteraction(key, [])
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
export const discordInteraction = async (key: CryptoKey, commands: Command[]) => {
  const handler = await createHandler(commands)

  return async (req: Request): Promise<Response> => {
    const invalid = await verifyRequestSignature(req, key)
    if (invalid) return invalid

    return Response.json(await handler(await req.json()))
  }
}

// ==========================================================================================
const validateCommand = <T extends RESTPostAPIApplicationCommandsJSONBody>(command: T): T => {
  if (command.type === undefined || command.type === ApplicationCommandType.ChatInput) {
    return commandSchema.passthrough().parse(command) as unknown as T
  } else if (command.type === ApplicationCommandType.Message || command.type === ApplicationCommandType.User) {
    return userCommandSchema.passthrough().parse(command) as T
  }
  return commandSchema.passthrough().parse(command) as unknown as T
}

export const defineCommand = <const T extends RESTPostAPIApplicationCommandsJSONBody>(command: T) => {
  command = validateCommand(command)

  return {
    command,
    createHandler(handler: DefineHandler<T>) {
      return {command, handler}
    },
  }
}
