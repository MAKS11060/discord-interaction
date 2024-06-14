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
import {Command, CommandSchema, ContextMenuCommandSchema, DefineHandler, OptionToObject} from './types.ts'
import {commandSchema, userCommandSchema} from './schema.ts'

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


export const commandToAct = (command: RESTPostAPIApplicationCommandsJSONBody) => {
  const out: Record<string, any> = {}

  out[command.name] ??= {} // def
  if (command.options) {
    out[command.name] = associateBy(command.options, (v) => v.name)

    for (const key in out[command.name]) {
      if (out[command.name][key].options) {
        // out[command.name][key] ??= {}
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

export const commandsInit = (init: Command[]) => {
  const out: Record<string, any> = {}
  // const commands: Record<string, any> = {}

  for (const {command, handler} of init) {
    const cAct = commandToAct(command) // to pretty obj
    console.log(cAct)

    for (const key in handler) {
      const l0 = handler[key]
      if (typeof l0 === 'function') {
        // out[key] = l0(command)
        out[key] = l0(cAct[key])
      }
      if (typeof l0 === 'object') {
        out[key] ??= {}
        for (const key2 in l0) {
          const l1 = l0[key2]
          if (typeof l1 === 'function') {
            // out[key][key2] = l1(command)
            out[key][key2] = l1(cAct[key][key2])
          }
          if (typeof l1 === 'object') {
            out[key][key2] ??= {}
            for (const key3 in l1) {
              const l2 = l1[key3]
              if (typeof l2 === 'function') {
                // out[key][key2][key3] = l2(command)
                out[key][key2][key3] = l2(cAct[key][key2][key3])
              }
            }
          }
        }
      }
    }
  }

  console.log(out)
  return out
}

export const createHandler = (commands: Command[]) => {
  const obj = commandsInit(commands) as any
  console.log(obj)

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
