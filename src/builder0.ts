import {
  APIApplicationCommandAutocompleteInteraction,
  APIApplicationCommandAutocompleteResponse,
  APIApplicationCommandInteraction,
  APICommandAutocompleteInteractionResponseCallbackData,
  APIInteraction,
  APIInteractionResponse,
  APIInteractionResponseCallbackData,
  APIInteractionResponseChannelMessageWithSource,
  APIInteractionResponseUpdateMessage,
  APIMessageComponentInteraction,
  APIModalSubmitInteraction,
  ApplicationCommandType,
  InteractionResponseType,
  InteractionType,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord-api-types/v10'
import {commandSchema, userCommandSchema} from './schema.ts'
import {CommandToScheme} from './types.ts'

export class InteractionContext<
  I extends APIInteraction,
  S extends RESTPostAPIChatInputApplicationCommandsJSONBody,
  Q = CommandToScheme<S>
> {
  constructor(readonly interaction: I, readonly command: S) {}

  get<K extends keyof Q>(name: K): Q[K] | null {
    const {interaction} = this
    if (interaction.type === InteractionType.Ping) throw new Error('Wrong interaction type')

    if (interaction.type === InteractionType.ApplicationCommand) {
      if (interaction.data.type === ApplicationCommandType.ChatInput) {
        for (const option of interaction.data.options || []) {
          if (option.name === name) {
            return option as Q[K]
          }
        }
      }
    }

    if (interaction.type === InteractionType.MessageComponent) {
      // if (interaction.data. === ApplicationCommandType.ChatInput) {
      // for (const option of interaction.data. || []) {
      //   if (option.name === name) {
      //     return option as Q[K]
      //   }
      // }
      // }
    }

    return null
  }

  /** send a message in response */
  reply(data: APIInteractionResponseCallbackData): APIInteractionResponseChannelMessageWithSource {
    return {
      type: InteractionResponseType.ChannelMessageWithSource,
      data,
    }
  }

  replyUpdate(data: APIInteractionResponseCallbackData): APIInteractionResponseUpdateMessage {
    return {
      type: InteractionResponseType.UpdateMessage,
      data,
    }
  }

  autocomplete(data: APICommandAutocompleteInteractionResponseCallbackData): APIApplicationCommandAutocompleteResponse {
    return {
      type: InteractionResponseType.ApplicationCommandAutocompleteResult,
      data,
    }
  }
}

interface CommandHandler<T extends RESTPostAPIChatInputApplicationCommandsJSONBody> {
  /**
   * @example
   * ```ts
   * command(c) {
   *   return c.reply({content: 'Hi'}) // reply command name
   * }
   * ```
   */
  command?(
    c: InteractionContext<APIApplicationCommandInteraction, T>
  ): APIInteractionResponse | Promise<APIInteractionResponse>
  messageComponent?(
    c: InteractionContext<APIMessageComponentInteraction, T>
  ): APIInteractionResponse | Promise<APIInteractionResponse>
  commandAutocomplete?(
    c: InteractionContext<APIApplicationCommandAutocompleteInteraction, T>
  ): APIInteractionResponse | Promise<APIInteractionResponse>
  modalSubmit?(
    c: InteractionContext<APIModalSubmitInteraction, T>
  ): APIInteractionResponse | Promise<APIInteractionResponse>
}

export interface Handler<
  T extends RESTPostAPIChatInputApplicationCommandsJSONBody = RESTPostAPIChatInputApplicationCommandsJSONBody
> {
  command: T
  executor: (command: T) => CommandHandler<T>
}

/**
 * Helper for create command with handler
 * @example
 * ```ts
 * const help = defineCommand({
 *   name: 'help',
 *   description: 'Show help',
 * }).createHandler(() => {
 *   return {
 *     command(c) {
 *       return c.reply({content: 'ok', flags: MessageFlags.Ephemeral})
 *     },
 *   }
 * })
 * ```
 */
export const defineCommand = <const T extends RESTPostAPIChatInputApplicationCommandsJSONBody>(command: T) => {
  // validate command
  if (command.type === undefined || command.type === ApplicationCommandType.ChatInput) {
    commandSchema.parse(command)
  } else if (command.type === ApplicationCommandType.Message || command.type === ApplicationCommandType.User) {
    userCommandSchema.parse(command)
  }

  return {
    command,
    createHandler(executor: (command: T) => CommandHandler<T>): Handler<T> {
      if (command.type === undefined || command.type === ApplicationCommandType.ChatInput) {
        command = commandSchema.passthrough().parse(command) as T
      } else if (command.type === ApplicationCommandType.Message || command.type === ApplicationCommandType.User) {
        command = userCommandSchema.passthrough().parse(command) as T
      }
      return {command, executor}
    },
  }
}

// ============================================= ExecutionTree

// import {associateBy} from '@std/collections/associate-by'
// import {
// APIApplicationCommandBasicOption,
//   APIApplicationCommandOption,
//   ApplicationCommandOptionType,
//   RESTPostAPIChatInputApplicationCommandsJSONBody,
// } from 'discord-api-types/v10'
// import {Pretty} from './types.ts'

// const def = <T extends RESTPostAPIChatInputApplicationCommandsJSONBody>(command: Pretty<T>) => command
// const defOptions = <T extends APIApplicationCommandOption[]>(options: Pretty<T>) => options

// type OptionsToObject<Options extends APIApplicationCommandOption> = Options extends {required: true}
//   ? {[K in Options as K['name']]: K}
//   : {[K in Options as K['name']]?: K}

// type ExtractOptions<T extends RESTPostAPIChatInputApplicationCommandsJSONBody> = T['options'] extends Array<infer O>
//   ? O extends APIApplicationCommandOption
//     ? O
//     : never
//   : never

// // type ExtractOptionsObj<T extends RESTPostAPIChatInputApplicationCommandsJSONBody> = T['options'] extends APIApplicationCommandBasicOption[] ?
// //   ? T['options'] extends APIApplicationCommandBasicOption
// //     ? OptionsToObject<T['options']>
// //     : never
// //   : never

// class Context<T extends RESTPostAPIChatInputApplicationCommandsJSONBody> {
//   // options: ExtractOptionsObj<T> | object

//   constructor(readonly command: Pretty<T>) {
//     if (command.options) {
//       // this.options = associateBy(command.options, it => it.name)
//       // this.options = {}
//     }
//   }

//   getOption(name: string) {
//     // const option = this.options.find((option) => option.name === name)
//   }
// }

// // type ExtractOptions<T extends APIApplicationCommandOption[]> = T extends Array<infer O>
// //   ? O extends APIApplicationCommandOption
// //     ? O
// //     : never
// //   : never

// const c = new Context({
//   name: 'test',
//   description: 'test',
//   options: [
//     {
//       type: ApplicationCommandOptionType.String,
//       name: 'str',
//       description: 'str',
//       required: true,
//     },
//     {
//       type: ApplicationCommandOptionType.Integer,
//       name: 'int',
//       description: 'Int',
//     },
//   ],
// })

// // =======================================
// const d = def({
//   name: 'test',
//   description: 'test',
//   options: [
//     {
//       type: ApplicationCommandOptionType.String,
//       name: 'str',
//       description: 'str',
//       required: true,
//     },
//     {
//       type: ApplicationCommandOptionType.Integer,
//       name: 'int',
//       description: 'Int',
//     },
//   ],
// })

// type D = typeof d
