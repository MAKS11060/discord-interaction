import {APIApplicationCommandBasicOption} from 'discord-api-types/payloads/v10/_interactions/_applicationCommands/chatInput.js'
import {APIApplicationCommandAutocompleteInteraction, APIApplicationCommandInteraction, APIApplicationCommandOption, APIInteraction, APIInteractionResponse, APIInteractionResponseCallbackData, APIInteractionResponseChannelMessageWithSource, APIMessageComponentInteraction, APIModalSubmitInteraction, ApplicationCommandOptionType, InteractionResponseType, RESTPostAPIChatInputApplicationCommandsJSONBody} from 'discord-api-types/v10'
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

type ParseInteraction<
  T extends RESTPostAPIChatInputApplicationCommandsJSONBody
> = T['options'] extends Array<infer O>
  ? O extends APIApplicationCommandOption
    ? ParseOption<O>
    : never
  : never

export class InteractionContext<
  I extends APIInteraction,
  Scheme extends RESTPostAPIChatInputApplicationCommandsJSONBody
> {
  constructor(
    readonly interaction: I,
    // readonly ctx: ParseInteraction<Scheme>
  ) {}

  // getOption(name: (typeof this.ctx)['name']) {
  //   return this.ctx[name]
  // }

  /** send a message in response */
  reply(
    data: APIInteractionResponseCallbackData,
  ): APIInteractionResponseChannelMessageWithSource {
    return {
      type: InteractionResponseType.ChannelMessageWithSource,
      data,
    }
  }
}

// ===================================================
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
export const defineCommand = <
  T extends RESTPostAPIChatInputApplicationCommandsJSONBody
>(
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
    command?(
      ctx: InteractionContext<APIApplicationCommandInteraction, T>,
    ): APIInteractionResponse
    messageComponent?(
      ctx: InteractionContext<APIMessageComponentInteraction, T>,
    ): APIInteractionResponse
    commandAutocomplete?(
      ctx: InteractionContext<APIApplicationCommandAutocompleteInteraction, T>,
    ): APIInteractionResponse
    modalSubmit?(
      ctx: InteractionContext<APIModalSubmitInteraction, T>,
    ): APIInteractionResponse
  },
) => {
  const command = commandScheme.passthrough().parse(init) as T
  return {...command, executor}
}

export type DefineCommand = ReturnType<typeof defineCommand>

// =================================================== Test
/*class Context<T extends APIApplicationCommandBasicOption[], S extends ToSchema<T>> {
  constructor(readonly options: Pretty<T>) {}

  get(name: keyof S['name']) {
    return this.options.find(value => value.name === name)!
  }
}

const c=  new Context([
  {
    type: ApplicationCommandOptionType.String,
    name: 'str',
    description: 'str',
  },
  {
    type: ApplicationCommandOptionType.Integer,
    name: 'int',
    description: 'int',
  },
])


type ToSchema<T extends APIApplicationCommandOption[]> = T extends Array<infer O>
  ? O extends APIApplicationCommandBasicOption
    ? Context<O>
    : never
  : never*/


// type ParseO<T extends APIApplicationCommandOption[] | undefined> =
//   T extends Array<infer A>
//     ? A extends APIApplicationCommandOption
//       ? {
//           get(name: A['name']): A
//         }
//       : never
//     : never

// type Def<T extends RESTPostAPIChatInputApplicationCommandsJSONBody> = {
//   [K in keyof T]: T[K] extends RESTPostAPIChatInputApplicationCommandsJSONBody['options']
//     ? ParseO<T[K]>
//     : T[K]
// }

// type T = Def<{
//   name: '1234'
//   description: '3123'
//   options: [
//     {
//       type: ApplicationCommandOptionType.String
//       name: 'str'
//       description: 'str'
//     },
//     {
//       type: ApplicationCommandOptionType.Integer
//       name: 'int'
//       description: 'int'
//     }
//   ]
// }>
