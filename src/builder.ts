import {
  APIApplicationCommandAutocompleteInteraction,
  APIApplicationCommandAutocompleteResponse,
  APIApplicationCommandInteraction,
  APIApplicationCommandOption,
  APICommandAutocompleteInteractionResponseCallbackData,
  APIInteraction,
  APIInteractionResponse,
  APIInteractionResponseCallbackData,
  APIInteractionResponseChannelMessageWithSource,
  APIInteractionResponseUpdateMessage,
  APIMessageComponentInteraction,
  APIModalSubmitInteraction,
  InteractionResponseType,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord-api-types/v10'
import {commandScheme} from './scheme.ts'

type Pretty<T extends object> = {
  [K in keyof T]: T[K] extends object ? Pretty<T[K]> : T[K]
}

// =================================================== Parse command
type OptionsContext<T extends APIApplicationCommandOption> = {
  get(name: T['name']): void
}

type ParseOption<T extends APIApplicationCommandOption> = OptionsContext<T>
// type ParseOption<T extends APIApplicationCommandOption> = T

type ParseInteraction<T extends RESTPostAPIChatInputApplicationCommandsJSONBody> = T['options'] extends Array<infer O>
  ? O extends APIApplicationCommandOption
    ? ParseOption<O>
    : never
  : never

export class InteractionContext<
  I extends APIInteraction,
  Scheme extends RESTPostAPIChatInputApplicationCommandsJSONBody
> {
  constructor(
    readonly interaction: I // readonly ctx: ParseInteraction<Scheme>
  ) {}

  // getOption(name: (typeof this.ctx)['name']) {
  //   return this.ctx[name]
  // }

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

/**
 * @example
 * ```ts
 * defineCommand({
 *   name: "hello",
 *   description: "Say hello",
 * }, () => {
 *   return {
 *     command(c) {
 *       return c.reply({content: 'Hello'})
 *     }
 *   }
 * })
 * ```
 */
export const defineCommand = <T extends RESTPostAPIChatInputApplicationCommandsJSONBody>(
  init: Pretty<T>,
  executor: (command: Readonly<T>) => {
    /**
     * @example
     * ```ts
     * command(c) {
     *   return c.reply({content: c.name}) // reply command name
     * }
     * ```
     */
    command?(ctx: InteractionContext<APIApplicationCommandInteraction, T>): APIInteractionResponse
    messageComponent?(ctx: InteractionContext<APIMessageComponentInteraction, T>): APIInteractionResponse
    commandAutocomplete?(
      ctx: InteractionContext<APIApplicationCommandAutocompleteInteraction, T>
    ): APIInteractionResponse
    modalSubmit?(ctx: InteractionContext<APIModalSubmitInteraction, T>): APIInteractionResponse
  }
) => {
  const command = commandScheme.passthrough().parse(init) as T
  return {...command, executor}
}

export type DefineCommand = ReturnType<typeof defineCommand>
