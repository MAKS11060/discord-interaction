#!/usr/bin/env -S deno run -A --watch

import {
  APIApplicationCommandBasicOption,
  APIApplicationCommandOption,
  APIApplicationCommandSubcommandGroupOption,
  APIApplicationCommandSubcommandOption,
  APIInteractionResponse,
  APIInteractionResponseCallbackData,
  APIInteractionResponseChannelMessageWithSource,
  APIInteractionResponseUpdateMessage,
  ApplicationCommandOptionType,
  ApplicationCommandType,
  InteractionResponseType,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord-api-types/v10'
import {commandSchema, userCommandSchema} from './schema.ts'
import {UnionToIntersection, Unpack} from './types.ts'

export class CommandCtx<
  C extends RESTPostAPIChatInputApplicationCommandsJSONBody | APIApplicationCommandOption,
  // T extends APIApplicationCommandOption
  T = C extends RESTPostAPIChatInputApplicationCommandsJSONBody ? C['options'] : APIApplicationCommandOption
> {
  command: C = {} as any
  options: T[]
  constructor(command: C, options?: T[]) {
    this.command = command
    this.options = options || []
  }

  getOption<K extends T['name']>(name: K): T extends {name: K} ? T : never {
    return this.options.find((option) => option.name === name) as any
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
}

// type CC = CommandCtx<
//   {name: 'test', description: 'd'},
//   Unpack<
//     [
//       {
//         type: ApplicationCommandOptionType.String
//         name: 's1'
//         description: 'a'
//       },
//       {
//         type: ApplicationCommandOptionType.String
//         name: 's2'
//         description: 'b'
//       }
//     ]
//   >
// >

/// 1. if options
///   2 if option (sub | sub-group)
///     3 if option sub
///       4 if option

///
/// OPTIONS
///

// type ExtractOptions<T extends APIApplicationCommandOption[] | undefined> = T extends Array<infer O>
// ? O extends APIApplicationCommandBasicOption
// ? O
// : never
// : never

/* type OmitSubCommand<T extends APIApplicationCommandOption> = T extends
  | APIApplicationCommandSubcommandGroupOption
  | APIApplicationCommandSubcommandOption
  ? never
  : T

type Handler<T extends APIApplicationCommandOption | RESTPostAPIChatInputApplicationCommandsJSONBody> =
  T extends RESTPostAPIChatInputApplicationCommandsJSONBody
    ? (c: CommandCtx<Unpack<T['options']>>) => APIInteractionResponse | Promise<APIInteractionResponse>
    : // : never
      (c: CommandCtx<T>) => APIInteractionResponse | Promise<APIInteractionResponse> // Handler<ExtractOptions<T>>

type OptionsToSchema<T extends APIApplicationCommandOption | undefined> = T extends APIApplicationCommandOption
  ? {[K in T['name']]: Handler<T>}
  : never

type Schema<T extends RESTPostAPIChatInputApplicationCommandsJSONBody> = T['options'] extends Array<infer O>
  ? O extends APIApplicationCommandOption
    ? {[K in T['name']]: OptionsToSchema<O>}
    : never
  : {[K in T['name']]: Handler<T>} // without options */

// type ParseOption<T extends APIApplicationCommandOption> = T extends APIApplicationCommandSubcommandOption
//   ? ParseOption<Unpack<T['options']>>
//   : T extends APIApplicationCommandSubcommandGroupOption
//   ? ParseOption<Unpack<T['options']>>
//   : // : {[K in T['name']]: (c: CommandCtx<T>) => APIInteractionResponse | Promise<APIInteractionResponse>}
//     (c: CommandCtx<T, Unpack<T['options']>>) => APIInteractionResponse | Promise<APIInteractionResponse>

// type CommandScheme<T extends RESTPostAPIChatInputApplicationCommandsJSONBody> = T extends Unpack<infer O>
// ? O extends APIApplicationCommandOption
// ? ParseOption<O>
// : never
// : (c: CommandCtx<Unpack<T['options']>>) => APIInteractionResponse | Promise<APIInteractionResponse>

type Handler<T> = (c: T) => APIInteractionResponse | Promise<APIInteractionResponse>

type CommandScheme<T extends RESTPostAPIChatInputApplicationCommandsJSONBody> = T['options'] extends Unpack<infer O>
  ? // ? {[K in T['name']]: ParseOption<Unpack<T['options']>>}
    // {[K in T['name']]: ParseOption<T>}
    {[K in T['name']]: Handler</* T */ CommandCtx<T, T['options']>>}
  : never

type C = DefineHandler<{
  name: 'main'
  description: 'a'
  options: [
    {
      type: ApplicationCommandOptionType.String
      name: 'str'
      description: '1'
    },
    {
      type: ApplicationCommandOptionType.String
      name: 'str'
      description: '1'
    }
  ]

  // options: [
  //   {
  //     type: ApplicationCommandOptionType.Subcommand
  //     name: 'str'
  //     description: '1'
  //     options: [
  //       {
  //         type: ApplicationCommandOptionType.String
  //         name: 'str'
  //         description: '1'
  //       },
  //       {
  //         type: ApplicationCommandOptionType.Integer
  //         name: 'int'
  //         description: '2'
  //       }
  //     ]
  //   }
  //   // {
  //   //   type: ApplicationCommandOptionType.String,
  //   //   name: "str",
  //   //   description: "1",
  //   // },
  //   // {
  //   //   type: ApplicationCommandOptionType.Integer,
  //   //   name: "int",
  //   //   description: "2",
  //   // }
  // ]
}>

type DefineHandler<T extends RESTPostAPIChatInputApplicationCommandsJSONBody> = UnionToIntersection<CommandScheme<T>>

const validateCommand = <T extends RESTPostAPIChatInputApplicationCommandsJSONBody>(command: T): T => {
  if (command.type === undefined || command.type === ApplicationCommandType.ChatInput) {
    return commandSchema.passthrough().parse(command) as T
  } else if (command.type === ApplicationCommandType.Message || command.type === ApplicationCommandType.User) {
    return userCommandSchema.passthrough().parse(command) as T
  }
  return commandSchema.passthrough().parse(command) as T
}

export const defineCommand = <const T extends RESTPostAPIChatInputApplicationCommandsJSONBody>(command: T) => {
  validateCommand(command)

  return {
    command,
    createHandler(handler: DefineHandler<T>) {
      return {
        command: validateCommand(command),
        handler,
      }
    },
  }
}
