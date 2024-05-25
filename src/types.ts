// import {
//   APIApplicationCommandAttachmentOption,
//   APIApplicationCommandBooleanOption,
//   APIApplicationCommandChannelOption,
//   APIApplicationCommandIntegerOption,
//   APIApplicationCommandInteractionDataAttachmentOption,
//   APIApplicationCommandInteractionDataBooleanOption,
//   APIApplicationCommandInteractionDataChannelOption,
//   APIApplicationCommandInteractionDataIntegerOption,
//   APIApplicationCommandInteractionDataMentionableOption,
//   APIApplicationCommandInteractionDataRoleOption,
//   APIApplicationCommandInteractionDataStringOption,
//   APIApplicationCommandInteractionDataSubcommandGroupOption,
//   APIApplicationCommandInteractionDataSubcommandOption,
//   APIApplicationCommandInteractionDataUserOption,
//   APIApplicationCommandMentionableOption,
//   APIApplicationCommandOption,
//   APIApplicationCommandRoleOption,
//   APIApplicationCommandStringOption,
//   APIApplicationCommandSubcommandGroupOption,
//   APIApplicationCommandSubcommandOption,
//   APIApplicationCommandUserOption,
//   RESTPostAPIChatInputApplicationCommandsJSONBody
// } from 'discord-api-types/v10'

import {
  APIInteractionResponse,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  APIApplicationCommandOption,
  APIApplicationCommandBasicOption,
  APIApplicationCommandSubcommandOption,
  APIApplicationCommandSubcommandGroupOption,
  ApplicationCommandOptionType,
  RESTPostAPIContextMenuApplicationCommandsJSONBody,
} from 'discord-api-types/v10'
import {ApplicationCommandContext, ContextMenuCommandContext} from './context.ts'

/** {} | {} => {} & {} */
export type UnionToIntersection<U> = (U extends any ? (arg: U) => void : never) extends (arg: infer R) => void
  ? R
  : never

/** unknown[] => {} | {} */
export type Unpack<T extends unknown[] | undefined> = T extends Array<infer O> ? O : never

export type EmptyArray<T> = T extends [] ? never : T

export type Handler<T> = (c: T) => APIInteractionResponse | Promise<APIInteractionResponse>

export type CommandScheme<T extends RESTPostAPIChatInputApplicationCommandsJSONBody> =
  T['options'] extends APIApplicationCommandOption[] & EmptyArray<T['options']>
    ? T['options'] extends Array<infer O> // 0
      ? O extends APIApplicationCommandBasicOption
        ? {[K in T['name']]: Handler<ApplicationCommandContext<T, Unpack<T['options']>>>} // 0(1)
        : O extends APIApplicationCommandSubcommandOption
        ? {
            [K in T['name']]: {
              [N in O['name']]: Handler<ApplicationCommandContext<O, Unpack<O['options']>>> // 1(2)
            }
          }
        : O extends APIApplicationCommandSubcommandGroupOption
        ? {
            [K in T['name']]: {
              [N in O['name']]: O['options'] extends Array<infer S>
                ? S extends APIApplicationCommandSubcommandOption
                  ? {[K in S['name']]: Handler<ApplicationCommandContext<S, Unpack<S['options']>>>} // 2(3)
                  : 2
                : 3
            }
          }
        : 1
      : {[K in T['name']]: Handler<ApplicationCommandContext<T, never>>}
    : {[K in T['name']]: Handler<ApplicationCommandContext<T, never>>}

export type ContextMenuCommandScheme<T extends RESTPostAPIContextMenuApplicationCommandsJSONBody> = {
  [K in T['name']]: Handler<ContextMenuCommandContext<T>>
}

export type Command = {
  command: CommandScheme<any> | ContextMenuCommandScheme<any>
  handler: Handler<any>
}

/** Type guard for `APIApplicationCommandOption` */
export type isType<T extends APIApplicationCommandOption, Type extends ApplicationCommandOptionType> = T extends T & {
  type: Type
}
  ? T
  : never
