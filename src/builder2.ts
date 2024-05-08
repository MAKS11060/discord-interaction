#!/usr/bin/env -S deno run -A --watch

import {
  APIApplicationCommandOption,
  APIInteractionResponse,
  APIInteractionResponseCallbackData,
  APIInteractionResponseChannelMessageWithSource,
  APIInteractionResponseUpdateMessage,
  ApplicationCommandType,
  InteractionResponseType,
  RESTPostAPIChatInputApplicationCommandsJSONBody
} from 'discord-api-types/v10'
import {commandSchema, userCommandSchema} from './schema.ts'
import {UnionToIntersection} from './types.ts'

// type Context<T extends APIApplicationCommandOption[] | undefined> = T extends APIApplicationCommandStringOption
//   ? APIApplicationCommandInteractionDataStringOption
//   : T extends APIApplicationCommandIntegerOption
//   ? APIApplicationCommandInteractionDataIntegerOption
//   : never

// type ParseOption<T extends APIApplicationCommandOption | undefined> = T extends APIApplicationCommandSubcommandOption
  // ? {[K in T['name']]: {exec: (options: Context<T['options']>) => unknown}}
  // : never

// type Schema<T extends RESTPostAPIChatInputApplicationCommandsJSONBody> = T['options'] extends Array<infer O>
//   ? O extends APIApplicationCommandOption
//     ? ParseOption<O> //{[K in ParseOption<O>['name']]: {exec: (options: ParseOption<O>) => unknown}}
//     : never
//   : {exec: (options: T) => unknown}

class CommandCtx<T> {
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

type Handler<T extends APIApplicationCommandOption | RESTPostAPIChatInputApplicationCommandsJSONBody> =
  T extends RESTPostAPIChatInputApplicationCommandsJSONBody
    ? (c: CommandCtx<T>) => APIInteractionResponse | Promise<APIInteractionResponse>
    : never


type OptionsToSchema<T extends APIApplicationCommandOption | undefined> = T extends APIApplicationCommandOption
  ? T['name']
  : never

type Schema<T extends RESTPostAPIChatInputApplicationCommandsJSONBody> = T['options'] extends Array<infer O>
  ?  O extends APIApplicationCommandOption
    ? OptionsToSchema<O>
    : never
    : {[K in T['name']]: Handler<T>} // without options


export type CommandToScheme<T extends RESTPostAPIChatInputApplicationCommandsJSONBody> = UnionToIntersection<Schema<T>>

// =============================================================================
type DefineHandler<T extends RESTPostAPIChatInputApplicationCommandsJSONBody> = Schema<T>

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
