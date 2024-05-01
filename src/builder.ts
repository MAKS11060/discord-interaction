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
  RESTPostAPIChatInputApplicationCommandsJSONBody
} from 'discord-api-types/v10'
import {commandScheme} from './scheme.ts'
import {CommandToScheme} from './types.ts'

export class InteractionContext<
  I extends APIInteraction,
  S extends RESTPostAPIChatInputApplicationCommandsJSONBody,
  Q = CommandToScheme<S>
> {
  // scheme: Scheme<S>
  constructor(readonly interaction: I, readonly command: S) {
    // this.scheme = {} as Scheme<S>
  }

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
  command?(c: InteractionContext<APIApplicationCommandInteraction, T>): APIInteractionResponse
  messageComponent?(c: InteractionContext<APIMessageComponentInteraction, T>): APIInteractionResponse
  commandAutocomplete?(c: InteractionContext<APIApplicationCommandAutocompleteInteraction, T>): APIInteractionResponse
  modalSubmit?(c: InteractionContext<APIModalSubmitInteraction, T>): APIInteractionResponse
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
  return {
    command,
    createHandler(executor: (command: T) => CommandHandler<T>): Handler<T> {
      command = commandScheme.passthrough().parse(command) as T
      return {command, executor}
    },
  }
}
