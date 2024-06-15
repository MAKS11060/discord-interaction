import {
  APIInteractionResponse,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  APIApplicationCommandOption,
  APIApplicationCommandBasicOption,
  APIApplicationCommandSubcommandOption,
  APIApplicationCommandSubcommandGroupOption,
  ApplicationCommandOptionType,
  RESTPostAPIContextMenuApplicationCommandsJSONBody,
  RESTPostAPIApplicationCommandsJSONBody,
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

type Autocomplete<T extends APIApplicationCommandOption> = T extends {autocomplete: true}
  ? {
      autocomplete(
        c: ApplicationCommandAutocompleteContext<T>
      ): APIInteractionResponse | Promise<APIInteractionResponse>
    }
  : never

export type isRequiredOption<T extends APIApplicationCommandBasicOption> = T extends {required: true} ? T : T | null

export type OptionToObject<T extends APIApplicationCommandOption> = {
  [K in T['name']]: T extends {name: K} ? T : never
}

export type CommandHandler<
  T extends RESTPostAPIChatInputApplicationCommandsJSONBody | APIApplicationCommandSubcommandOption,
  O extends APIApplicationCommandOption
> = (command: OptionToObject<O>) =>
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
      /**
       * Handle `modal` submission
       *
       * @example
       * ```ts
       * modalSubmit: (c) => {
       *   if (c.data.custom_id === 'input') {
       *     return c.reply({content: 'modal'})
       *   }
       * }
       * ```
       */
      modalSubmit?(c: ModalContext): APIInteractionResponse | Promise<APIInteractionResponse> | void
    }
  | Autocomplete<O>

export type ContextMenuHandler<
  T extends RESTPostAPIContextMenuApplicationCommandsJSONBody,
  O extends APIApplicationCommandOption = any
> = (command: OptionToObject<O>) => {
  command(c: ContextMenuCommandContext<T>): APIInteractionResponse | Promise<APIInteractionResponse>
}

export type CommandSchema<T extends RESTPostAPIChatInputApplicationCommandsJSONBody> =
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
        : never
      : {[K in T['name']]: CommandHandler<T, never>}
    : {[K in T['name']]: CommandHandler<T, never>}

export type ContextMenuCommandSchema<T extends RESTPostAPIContextMenuApplicationCommandsJSONBody> = {
  [K in T['name']]: ContextMenuHandler<T>
}

export type Handler = CommandHandler<any, never> | ContextMenuHandler<any>

type HandlerRecord = Record<string, Handler | Record<string, Handler | Record<string, Handler>>>

export type Command = {
  command: CommandSchema<any> | ContextMenuCommandSchema<any> | any // FIX: remove any
  handler: HandlerRecord
}

export type DefineHandler<T extends RESTPostAPIApplicationCommandsJSONBody> =
  T extends RESTPostAPIChatInputApplicationCommandsJSONBody
    ? CommandSchema<T>
    : T extends RESTPostAPIContextMenuApplicationCommandsJSONBody
    ? ContextMenuCommandSchema<T>
    : never
