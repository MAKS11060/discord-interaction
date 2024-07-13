import {associateBy} from '@std/collections/associate-by'
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  InteractionResponseType,
  InteractionType,
  MessageFlags,
  type APIApplicationCommandInteractionDataBasicOption,
  type APIApplicationCommandOption,
  type APIInteraction,
  type APIInteractionResponse,
  type APIMessageInteractionMetadata,
  type RESTPostAPIApplicationCommandsJSONBody,
} from 'discord-api-types/v10'
import {
  ApplicationCommandAutocompleteContext,
  ApplicationCommandContext,
  ContextMenuCommandContext,
  MessageComponentContext,
  ModalContext,
} from './context.ts'
import {verifyRequestSignature} from './lib/ed25519.ts'
import {commandSchema, userOrMessageCommandSchema} from './schema.ts'
import type {Command, DefineHandler} from './types.ts'

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

  return out
}

const commandsInit = async (init: Command[]) => {
  const executionTree: Record<string, any> = {}
  const commandsTree: Record<string, any> = {}

  for (const {command, handler} of init) {
    const cAct = commandToAct(command) // to pretty obj
    // console.log(cAct)
    for (const key in cAct) {
      commandsTree[key] = cAct[key]
    }

    for (const key in handler) {
      const l0 = handler[key]
      if (typeof l0 === 'function') {
        // out[key] = await l0()
        executionTree[key] = await l0(cAct[key])
      }
      if (typeof l0 === 'object') {
        executionTree[key] ??= {}
        for (const key2 in l0) {
          const l1 = l0[key2]
          if (typeof l1 === 'function') {
            // out[key][key2] = await l1()
            executionTree[key][key2] = await l1(cAct[key][key2])
          }
          if (typeof l1 === 'object') {
            executionTree[key][key2] ??= {}
            for (const key3 in l1) {
              const l2 = l1[key3]
              if (typeof l2 === 'function') {
                // out[key][key2][key3] = await l2()
                executionTree[key][key2][key3] = await l2(cAct[key][key2][key3])
              }
            }
          }
        }
      }
    }
  }

  return {executionTree, commandsTree}
}

export const createHandler = async (commands: Command[]) => {
  const {executionTree, commandsTree} = await commandsInit(commands)

  return async (interaction: APIInteraction): Promise<APIInteractionResponse> => {
    if (interaction.type === InteractionType.Ping) {
      return {type: InteractionResponseType.Pong}
    }

    if (interaction.type === InteractionType.ApplicationCommand) {
      if (interaction.data.type === ApplicationCommandType.ChatInput) {
        if (!interaction.data.options) {
          const c = new ApplicationCommandContext(
            interaction,
            commandsTree[interaction.data.name],
            {}
          )
          return (
            executionTree[interaction.data.name]?.command(c) ??
            unknownCommand('command handler is undefined')
          )
        } else {
          for (const option of interaction.data.options) {
            if (option.type === ApplicationCommandOptionType.Subcommand) {
              const c = new ApplicationCommandContext(
                interaction,
                commandsTree[interaction.data.name][option.name],
                associateBy(option.options ?? [], (el) => el.name)
              )
              return (
                executionTree[interaction.data.name][option.name]?.command(c) ??
                unknownCommand('command handler is undefined')
              )
            }

            if (option.type === ApplicationCommandOptionType.SubcommandGroup) {
              for (const subOption of option.options) {
                if (subOption.type === ApplicationCommandOptionType.Subcommand) {
                  const c = new ApplicationCommandContext(
                    interaction,
                    commandsTree[interaction.data.name][option.name][subOption.name],

                    associateBy(subOption.options ?? [], (el) => el.name)
                  )
                  return (
                    executionTree[interaction.data.name][option.name][subOption.name]?.command(c) ??
                    unknownCommand('command handler is undefined')
                  )
                }
              }
            }

            if (executionTree[interaction.data.name]?.command) {
              const c = new ApplicationCommandContext(
                interaction,
                commandsTree[interaction.data.name],
                associateBy(
                  (interaction.data.options as APIApplicationCommandInteractionDataBasicOption[]) ??
                    [],
                  (el) => el.name
                )
              )
              return (
                executionTree[interaction.data.name]?.command(c) ??
                unknownCommand('command handler is undefined')
              )
            }
          }
        }
      }

      if (interaction.data.type === ApplicationCommandType.User) {
        const c = new ContextMenuCommandContext(executionTree[interaction.data.name])
        return (
          executionTree[interaction.data.name]?.command(c) ??
          unknownCommand('command handler is undefined')
        )
      }

      if (interaction.data.type === ApplicationCommandType.Message) {
        const c = new ContextMenuCommandContext(executionTree[interaction.data.name])
        return (
          executionTree[interaction.data.name]?.command(c) ??
          unknownCommand('command handler is undefined')
        )
      }
    }

    if (interaction.type === InteractionType.MessageComponent) {
      const c = new MessageComponentContext(interaction)
      const metadata = interaction.message?.interaction_metadata as
        | (APIMessageInteractionMetadata & {name: string})
        | undefined

      if (metadata?.type === InteractionType.ApplicationCommand) {
        const name = metadata?.name as string
        if (!name) return unknownCommand('Message Component interaction_metadata.name is undefined')
        const keys = name.split(' ', 3) // 'cmd sub-group sub'

        const handlers = keys.reduce((acc, key) => acc[key], executionTree) // obj[cmd][sub-group][sub]
        return (
          handlers?.messageComponent(c) ?? unknownCommand('messageComponent handler is undefined')
        )
      }

      return unknownCommand('messageComponent handler is undefined')
    }

    if (interaction.type === InteractionType.ApplicationCommandAutocomplete) {
      if (interaction.data.type !== ApplicationCommandType.ChatInput) {
        return unknownCommand('commandAutocomplete handler is undefined')
      }

      // console.log(executionTree)
      for (const option of interaction.data.options) {
        if (
          option.type === ApplicationCommandOptionType.Subcommand ||
          option.type === ApplicationCommandOptionType.SubcommandGroup
        ) {
          for (const option2 of option.options ?? []) {
            if (option2.type === ApplicationCommandOptionType.Subcommand) {
              // l2
              const c = new ApplicationCommandAutocompleteContext(
                interaction,
                associateBy(
                  (option2.options as APIApplicationCommandInteractionDataBasicOption[]) ?? [],
                  (el) => el.name
                )
              )
              return (
                executionTree[interaction.data.name][option.name][option2.name]?.autocomplete(c) ??
                unknownCommand('commandAutocomplete handler is undefined')
              )
            }

            // l1
            const c = new ApplicationCommandAutocompleteContext(
              interaction,
              associateBy(
                (option.options as APIApplicationCommandInteractionDataBasicOption[]) ?? [],
                (el) => el.name
              )
            )
            return (
              executionTree[interaction.data.name][option.name]?.autocomplete(c) ??
              unknownCommand('commandAutocomplete handler is undefined')
            )
          }
          return unknownCommand('commandAutocomplete handler is undefined')
        }

        // l0
        const c = new ApplicationCommandAutocompleteContext(
          interaction,
          associateBy(
            (interaction.data.options as APIApplicationCommandInteractionDataBasicOption[]) ?? [],
            (el) => el.name
          )
        )
        return (
          executionTree[interaction.data.name]?.autocomplete(c) ??
          unknownCommand('commandAutocomplete handler is undefined')
        )
      }

      return unknownCommand('commandAutocomplete handler is undefined')
    }

    if (interaction.type === InteractionType.ModalSubmit) {
      // Discord did not provide interaction metadata
      const c = new ModalContext(interaction.data)
      const metadata = interaction.message?.interaction_metadata as
        | (APIMessageInteractionMetadata & {name: string})
        | undefined

      if (metadata?.type === InteractionType.ApplicationCommand) {
        const name = metadata?.name as string
        if (!name) return unknownCommand('Message Component interaction_metadata.name is undefined')
        const keys = name.split(' ', 3) // 'cmd sub-group sub'

        const handlers = keys.reduce((acc, key) => acc[key], executionTree) // obj[cmd][sub-group][sub]
        return handlers?.modalSubmit(c) ?? unknownCommand('modalSubmit handler is undefined')
      }

      // best solution so far
      // fire all modalSubmit handler. if use ApplicationCommandContext.modal()
      for (const key1 in executionTree) {
        const l1 = executionTree[key1]
        if (l1?.modalSubmit) {
          const res = await l1.modalSubmit(c)
          if (res) return res
        } else {
          for (const key2 in l1) {
            const l2 = l1[key2]
            if (l2?.modalSubmit) {
              const res = await l2.modalSubmit(c)
              if (res) return res
            } else {
              for (const key3 in l2) {
                const l3 = l2[key3]
                if (l3?.modalSubmit) {
                  const res = await l3.modalSubmit(c)
                  if (res) return res
                }
              }
            }
          }
        }
      }

      return unknownCommand('modalSubmit handler is undefined')
    }

    return unknownCommand()
  }
}

/**
 * Example built on web standards
 *
 * @param {CryptoKey} key - The CryptoKey object representing the public key to use for verifying the signature of the interaction.
 * @param {Command[]} commands - An array of Command objects representing the commands that the bot supports.
 * @returns {Promise<(req: Request) => Promise<Response>>} A promise that resolves to a function that can be used to handle Discord interactions.
 *
 * @example
 * ```ts
 * import {importKeyRaw, discordInteraction} from '@maks11060/discord-interactions'
 * import {commands} from './commands.ts'
 *
 * const key = await importKeyRaw(Deno.env.get('CLIENT_PUBLIC_KEY')!)
 * const interaction = await discordInteraction(key, commands)
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
export const discordInteraction = async (
  key: CryptoKey,
  commands: Command[]
): Promise<(req: Request) => Promise<Response>> => {
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
  } else if (
    command.type === ApplicationCommandType.Message ||
    command.type === ApplicationCommandType.User
  ) {
    return userOrMessageCommandSchema.passthrough().parse(command) as T
  }
  return commandSchema.passthrough().parse(command) as unknown as T
}

/**
 * DefineCommand for discord-interaction handler
 *
 * @example
 * ```ts
 * import {defineCommand, format} from '@maks11060/discord-interactions'
 *
 * const hello = defineCommand({
 *   name: 'hello',
 *   description: 'says hi',
 * }).createHandler({
 *   hello: () => {
 *     return {
 *       command: (c) => {
 *         return c.reply({
 *           content: `Hello ${format.user(c.user.id)}`,
 *         })
 *       },
 *     }
 *   },
 * })
 * ```
 */
export const defineCommand = <const T extends RESTPostAPIApplicationCommandsJSONBody>(
  command: T
): {
  command: T
  createHandler(handler: DefineHandler<T>): {
    command: T
    handler: DefineHandler<T>
  }
} => {
  command = validateCommand(command)

  return {
    command,
    createHandler(handler: DefineHandler<T>) {
      return {command, handler}
    },
  }
}

// export const defineCommands = <const T extends RESTPostAPIApplicationCommandsJSONBody[]>(
//   commands: T
// ): {
//   commands: T
//   createHandler(handler: DefineHandlerArray<T>): {
//     commands: T
//     handler: DefineHandlerArray<T>
//   }
// } => {
//   return {
//     commands,
//     createHandler(handler: DefineHandlerArray<T>) {
//       return {commands, handler}
//     },
//   }
// }
