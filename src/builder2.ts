#!/usr/bin/env -S deno run -A --watch

import {
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
  T extends APIApplicationCommandOption
  // T extends APIApplicationCommandOption
  // T extends APIApplicationCommandOption = C extends RESTPostAPIChatInputApplicationCommandsJSONBody
  // ? Unpack<C['options']>
  // : C
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

type Handler<T> = (c: T) => APIInteractionResponse | Promise<APIInteractionResponse>

// 1
// type CommandScheme<T extends RESTPostAPIChatInputApplicationCommandsJSONBody> = T['options'] extends Unpack<infer O>
//   ? // ? {[K in T['name']]: ParseOption<Unpack<T['options']>>}
//     // {[K in T['name']]: ParseOption<T>}
//     {[K in T['name']]: Handler</* T */ CommandCtx<T, Unpack<T['options']>>>}
//   : never

// 2
// type CommandScheme<T extends RESTPostAPIChatInputApplicationCommandsJSONBody> =
//   T extends RESTPostAPIChatInputApplicationCommandsJSONBody
//     ? {[K in T['name']]: Handler</* T */ CommandCtx<T, Unpack<T['options']>>>}
//     : never

// 3
// type CommandScheme<T extends RESTPostAPIChatInputApplicationCommandsJSONBody> =
//   T extends RESTPostAPIChatInputApplicationCommandsJSONBody
//     ? {[K in T['name']]: Handler</* T */ CommandCtx<T, Unpack<T['options']>>>}
//     : never

// type SubCommand<T extends APIApplicationCommandOption[] | undefined> = T extends Array<infer O>
//   ? O extends APIApplicationCommandSubcommandOption
//     ? /* O */ {[K in O['name']]: Handler</* T */ CommandCtx<O, Unpack<O['options']>>>}
//     : O extends APIApplicationCommandSubcommandGroupOption
//     ? SubCommand<O['options']>
//     : O extends APIApplicationCommandOption
//     ? O //{[K in O['name']]: Handler<CommandCtx<O, Unpack<O['options']>>>}
//     : never
//   : never

// type CommandScheme2<T extends RESTPostAPIChatInputApplicationCommandsJSONBody> =
//   T['options'] extends APIApplicationCommandOption[]
//     ? {[K in T['name']]: SubCommand<T['options']>}
//     : {[K in T['name']]: Handler<CommandCtx<T, Unpack<T['options']>>>}

// type C2 = CommandScheme2<{
//   name: 'test3'
//   description: 'a'
//   options: [
//   //   {
//   //     type: ApplicationCommandOptionType.Subcommand
//   //     name: 'sub'
//   //     description: 'b'
//   //     options: [
//         {type: ApplicationCommandOptionType.String; name: 'str'; description: '1'},
//         {type: ApplicationCommandOptionType.Integer; name: 'int'; description: '2'}
//   //     ]
//   //   }
//   ]
// }>

// type C = SubCommand<
//   [
//     {
//       type: ApplicationCommandOptionType.SubcommandGroup
//       name: 'sub'
//       description: 'b'
//       options: [
//         {
//           type: ApplicationCommandOptionType.Subcommand
//           name: 'sub'
//           description: 'b'
//           options: [// {type: ApplicationCommandOptionType.String; name: 'str'; description: '1'},
//           // {type: ApplicationCommandOptionType.Integer; name: 'int'; description: '2'}]
//         }
//       ]
//     }
//   ]
// >

/* type EmptyArray<T> = T extends [] ? never : T

type Test<T extends RESTPostAPIChatInputApplicationCommandsJSONBody> =
  T['options'] extends APIApplicationCommandOption[] & EmptyArray<T['options']>
    ? 0
    : {[K in T['name']]: Handler<CommandCtx<T, never>>} */

// type Test<T extends RESTPostAPIChatInputApplicationCommandsJSONBody> =
//   T['options'] extends APIApplicationCommandOption[]
//     ? {[K in T['name']]: Handler<CommandCtx<T, Unpack<T['options']>>>}
//     : {[K in T['name']]: Handler<CommandCtx<T, never>>}

type Test<T extends RESTPostAPIChatInputApplicationCommandsJSONBody> = T['options'] extends Array<infer O>
  ? O extends APIApplicationCommandOption
    ? {[K in O['name']]: Handler<CommandCtx<O, never>>}
    : never
  : never

// ? {[K in T['name']]: Handler<CommandCtx<T, Unpack<T['options']>>>}
// : {[K in T['name']]: Handler<CommandCtx<T, never>>}

type CommandScheme<T extends RESTPostAPIChatInputApplicationCommandsJSONBody> =
  T['options'] extends APIApplicationCommandOption[]
    ? T['options'] extends any[]
      ? {[K in T['name']]: Handler<CommandCtx<T, Unpack<T['options']>>>}
      : T
    : {[K in T['name']]: Handler<CommandCtx<T, never>>}

// ============================================================
type O1 = {type: ApplicationCommandOptionType.String; name: 'str'; description: '1'}
type O2 = {type: ApplicationCommandOptionType.Subcommand; name: 'sub'; description: '2'; options: [O1]}
type O3 = {type: ApplicationCommandOptionType.SubcommandGroup; name: 'str'; description: '3'; options: [O2]}
type A = Test<{name: 'test'; description: 'a'}>
type B = Test<{name: 'test'; description: 'a'; options: []}>
type C = Test<{name: 'test'; description: 'a'; options: [O1]}>
type D = Test<{name: 'test'; description: 'a'; options: [O3]}>

type DefineHandler<T extends RESTPostAPIChatInputApplicationCommandsJSONBody> = UnionToIntersection<CommandScheme<T>>
type test1 = DefineHandler<{name: 'test'; description: 'a'}>
type test11 = DefineHandler<{name: 'test'; description: 'a'; options: []}>
type test2 = DefineHandler<{
  name: 'test2'
  description: 'a'
  options: [
    {type: ApplicationCommandOptionType.String; name: 'str'; description: '1'},
    {type: ApplicationCommandOptionType.Integer; name: 'int'; description: '2'}
  ]
}>
type test3 = DefineHandler<{
  name: 'test3'
  description: 'a'
  options: [
    {
      type: ApplicationCommandOptionType.Subcommand
      name: 'sub'
      description: 'b'
      options: [
        {type: ApplicationCommandOptionType.String; name: 'str'; description: '1'},
        {type: ApplicationCommandOptionType.Integer; name: 'int'; description: '2'}
      ]
    }
  ]
}>

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

// type C = DefineHandler<{
//   name: 'main'
//   description: 'a'
//   options: [
//     {type: ApplicationCommandOptionType.String; name: 'str'; description: '1'},
//     {type: ApplicationCommandOptionType.String; name: 'str2'; description: '2'}
//   ]
//   // options: [
//   //   {
//   //     type: ApplicationCommandOptionType.Subcommand
//   //     name: 'str'
//   //     description: '1'
//   //     options: [
//   //       {type: ApplicationCommandOptionType.String; name: 'str'; description: '1'},
//   //       {type: ApplicationCommandOptionType.Integer; name: 'int'; description: '2'}
//   //     ]
//   //   }
//   // ]
// }>

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
