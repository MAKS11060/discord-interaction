import type {
  APIApplicationCommandBasicOption,
  APIApplicationCommandOption,
  APIApplicationCommandSubcommandGroupOption,
  APIApplicationCommandSubcommandOption,
  APIInteractionResponse,
  ApplicationCommandType,
  RESTPostAPIApplicationCommandsJSONBody,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  RESTPostAPIContextMenuApplicationCommandsJSONBody,
} from 'discord-api-types/v10'
import type {
  ApplicationCommandAutocompleteContext,
  ApplicationCommandContext,
  MessageComponentContext,
  MessageMenuCommandContext,
  ModalContext,
  UserMenuCommandContext,
} from './context.ts'

/** `{} | {} => {} & {}` */
export type UnionToIntersection<U> = (U extends any ? (arg: U) => void : never) extends (
  arg: infer R
) => void
  ? R
  : never

/**
 * Array To Union
 * `unknown[] => {} | {}`
 */
export type Unpack<T extends unknown[] | undefined> = T extends Array<infer O> ? O : never

export type EmptyArray<T> = T extends [] ? never : T

export type isRequiredOption<T extends APIApplicationCommandBasicOption> = T extends {
  required: true
}
  ? T
  : T | null

export type OptionToObject<T extends APIApplicationCommandOption> = {
  [K in T['name']]: T extends {name: K} ? T : never
}

export type CommandHandler<
  T extends RESTPostAPIChatInputApplicationCommandsJSONBody | APIApplicationCommandSubcommandOption,
  O extends APIApplicationCommandOption
> = (command: OptionToObject<O>) => {
  /**
   * @example
   * ```ts
   * command(c) {
   *   return c.reply({content: 'ok'})
   * }
   * ```
   */
  command(
    c: ApplicationCommandContext<T, O>
  ): APIInteractionResponse | Promise<APIInteractionResponse>

  /**
   * Handle `messageComponent`
   *
   * @example
   * ```ts
   * messageComponent(c) {
   *   return c.replyUpdate({
   *     components: [
   *       {
   *         type: ComponentType.ActionRow,
   *         components: [
   *           {
   *             type: ComponentType.Button,
   *             style: ButtonStyle.Success,
   *             label: `btn`,
   *             custom_id: JSON.stringify(['btn', btn]),
   *           }
   *         ],
   *       },
   *     ],
   *   })
   * }
   * ```
   */
  messageComponent?(
    c: MessageComponentContext
  ): APIInteractionResponse | Promise<APIInteractionResponse | void> | void

  /**
   * Handle `modal` submission
   *
   * @example
   * ```ts
   * modalSubmit(c) {
   *   if (c.data.custom_id === 'input') {
   *     return c.reply({content: 'modal'})
   *   }
   * }
   * ```
   */
  modalSubmit?(c: ModalContext): APIInteractionResponse | Promise<APIInteractionResponse> | void

  /**
   * Handle `autocomplete`
   *
   * @example
   * ```ts
   * autocomplete(c) {
   *   return c.autocomplete({
   *     choices: [
   *       {name: 'hello', value: 'hello'},
   *       {name: 'autocomplete', value: 'autocomplete'},
   *     ],
   *   })
   * }
   * ```
   */
  autocomplete?(
    c: ApplicationCommandAutocompleteContext<O>
  ): APIInteractionResponse | Promise<APIInteractionResponse>
}

type UserMenuCommandContextHandler /* <
  T extends RESTPostAPIContextMenuApplicationCommandsJSONBody = any
> */ = (/* command: T */) => {
  command(c: UserMenuCommandContext): APIInteractionResponse | Promise<APIInteractionResponse>
}
type MessageMenuCommandContextHandler /* <T extends RESTPostAPIContextMenuApplicationCommandsJSONBody> */ =
  (/* command: T */) => {
    command(c: MessageMenuCommandContext): APIInteractionResponse | Promise<APIInteractionResponse>
  }

export type ContextMenuHandler = UserMenuCommandContextHandler | MessageMenuCommandContextHandler

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

export type ContextMenuCommandSchema<T extends RESTPostAPIContextMenuApplicationCommandsJSONBody> =
  T['type'] extends ApplicationCommandType.User
    ? {
        [K in T['name']]: UserMenuCommandContextHandler
      }
    : T['type'] extends ApplicationCommandType.Message
    ? {
        [K in T['name']]: MessageMenuCommandContextHandler
      }
    : never

export type Handler = CommandHandler<any, any> | ContextMenuHandler

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
