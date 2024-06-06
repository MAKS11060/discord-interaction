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
import {
  ApplicationCommandAutocompleteContext,
  ApplicationCommandContext,
  ContextMenuCommandContext,
  MessageComponentContext,
  ModalContext,
} from './context.ts'

/** `{} | {} => {} & {}` */
export type UnionToIntersection<U> = (U extends any ? (arg: U) => void : never) extends (arg: infer R) => void
  ? R
  : never

/**
 * Array To Union
 * `unknown[] => {} | {}`
 */
export type Unpack<T extends unknown[] | undefined> = T extends Array<infer O> ? O : never

export type EmptyArray<T> = T extends [] ? never : T

export type CommandHandler<
  T extends RESTPostAPIChatInputApplicationCommandsJSONBody | APIApplicationCommandSubcommandOption,
  O extends APIApplicationCommandOption | never
> = (command: T) =>
  | {
      /**
       * @example
       * ```ts
       * {
       *   command: (c) => c.reply({content: 'Ok'})
       * }
       * ```
       */
      command(c: ApplicationCommandContext<T, O>): APIInteractionResponse | Promise<APIInteractionResponse>
      messageComponent?(c: MessageComponentContext): APIInteractionResponse | Promise<APIInteractionResponse>
      modalSubmit?(c: ModalContext): APIInteractionResponse | Promise<APIInteractionResponse>
    }
  | Autocomplete<O>

type Autocomplete<T extends APIApplicationCommandOption> = T extends {autocomplete: true}
  ? {
      autocomplete(
        c: ApplicationCommandAutocompleteContext<T>
      ): APIInteractionResponse | Promise<APIInteractionResponse>
    }
  : never

// type B = Autocomplete<{
//   type: ApplicationCommandOptionType.String
//   name: string
//   description: ''
//   autocomplete: true
// }>

export type CommandScheme<T extends RESTPostAPIChatInputApplicationCommandsJSONBody> =
  T['options'] extends APIApplicationCommandOption[] & EmptyArray<T['options']>
    ? T['options'] extends Array<infer O> // 0
      ? O extends APIApplicationCommandBasicOption
        ? {[K in T['name']]: CommandHandler<T, Unpack<T['options']>>} // 0(1)
        : O extends APIApplicationCommandSubcommandOption
        ? {
            [K in T['name']]: {
              [N in O['name']]: CommandHandler<O, Unpack<O['options']>> // 1(2)
            }
          }
        : O extends APIApplicationCommandSubcommandGroupOption
        ? {
            [K in T['name']]: {
              [N in O['name']]: O['options'] extends Array<infer S>
                ? S extends APIApplicationCommandSubcommandOption
                  ? {[K in S['name']]: CommandHandler<S, Unpack<S['options']>>} // 2(3)
                  : 2
                : 3
            }
          }
        : 1
      : {[K in T['name']]: CommandHandler<T, never>}
    : {[K in T['name']]: CommandHandler<T, never>}

export type HandlerFn<T> = (c: T) => APIInteractionResponse | Promise<APIInteractionResponse>
export type Handler<T> = (schema: unknown) => Record<string, HandlerFn<T>>

export type ContextMenuCommandScheme<T extends RESTPostAPIContextMenuApplicationCommandsJSONBody> = {
  [K in T['name']]: Handler<ContextMenuCommandContext<T>>
}

export type InitHandler = Record<
  string,
  Handler<unknown> | Record<string, Handler<unknown> | Record<string, Handler<unknown>>>
  // Record<string, Record<string, Handler<unknown>> | Handler<unknown>> | Handler<unknown>
>

// export type InitHandler = {
//   [K: string]:
//     | Handler<unknown>
//     | {
//         [K: string]:
//           | Handler<unknown>
//           | {
//               [K: string]: Handler<unknown>
//             }
//       }
// }

export type Command = {
  command: CommandScheme<any> | ContextMenuCommandScheme<any>
  handler: InitHandler //Handler<any>
}

type isRequired<T extends APIApplicationCommandBasicOption> = T extends APIApplicationCommandBasicOption & {
  required: true
}
  ? T
  : never

/**
 * ```ts
 * [{type: ApplicationCommandOptionType.String, name: 'str', description: '1'}] // =>
 * {str: {type: ApplicationCommandOptionType.String, name: 'str', description: '1'}}
 * ```
 */
export type OptionToObject<T extends APIApplicationCommandOption> = {
  [K in T['name']]: T extends {name: K} ? T : never
}
