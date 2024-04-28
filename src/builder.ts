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
  ApplicationCommandOptionType,
  ApplicationCommandType,
  InteractionResponseType,
  RESTPostAPIApplicationCommandsJSONBody,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord-api-types/v10'
import {commandScheme} from './scheme.ts'
import {Pretty} from './types.ts'

// =================================================== Parse command
// type OptionsContext<T extends APIApplicationCommandOption> = {
//   get(name: T['name']): void
// }

// type ParseOption<T extends APIApplicationCommandOption> = OptionsContext<T>
// type ParseOption<T extends APIApplicationCommandOption> = T

// type ParseInteraction<T extends RESTPostAPIChatInputApplicationCommandsJSONBody> = T['options'] extends Array<infer O>
//   ? O extends APIApplicationCommandOption
//     ? ParseOption<O>
//     : never
//   : never

type ExtractOptions<T extends RESTPostAPIChatInputApplicationCommandsJSONBody> = T['options'] extends Array<infer O>
  ? O extends APIApplicationCommandOption
    ? O
    : never
  : never

type ParseSchema<T extends RESTPostAPIApplicationCommandsJSONBody> =
  T extends RESTPostAPIChatInputApplicationCommandsJSONBody ? T : never

export class InteractionContext<
  I extends APIInteraction,
  Scheme extends RESTPostAPIChatInputApplicationCommandsJSONBody
> {
  constructor(
    readonly interaction: I
    // readonly ctx: ParseInteraction<Scheme>
  ) {}

  get<T extends ExtractOptions<ParseSchema<Scheme>>['name']>(name: T) {
    if (this.interaction.type === ApplicationCommandType.ChatInput) {
      this.interaction
    }
    return
  }

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
  executor: (command: T) => CommandHandler<T>
) => {
  const command = commandScheme.passthrough().parse(init) as T
  return {...command, executor}
}

export type DefineCommand = ReturnType<typeof defineCommand>

// =================================================== //

/* defineCommand(
  {
    name: 't',
    description: 't',
    options: [
      {
        type: ApplicationCommandOptionType.String,
        name: 'autocomplete',
        description: 'autocomplete',
        autocomplete: true,
      },
    ],
  },
  () => {
    return {
      command(c) {
        return c.reply({content: ''})
      },
    }
  }
)

const defCommand = <T extends RESTPostAPIChatInputApplicationCommandsJSONBody>(init: Pretty<T>) => {
  return commandScheme.passthrough().parse(init) as T
}
const createHandler = <T extends RESTPostAPIChatInputApplicationCommandsJSONBody>(
  command: T,
  handler: (init: Readonly<T>) => CommandHandler<T>
) => {}

const command = defCommand({
  name: 'test',
  description: 'd',
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: 'autocomplete',
      description: 'autocomplete',
      autocomplete: true,
    },
  ],
})

createHandler(command, () => {
  return {
    command(c) {
      return c.reply({content: ''})
    },
  }
})
 */
