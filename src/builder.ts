import {
  APIApplicationCommandInteraction,
  APIApplicationCommandOption,
  APIInteraction,
  APIInteractionResponse,
  APIInteractionResponseCallbackData,
  APIInteractionResponseChannelMessageWithSource,
  InteractionResponseType,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'npm:discord-api-types/v10'
import {commandScheme} from './scheme.ts'

type DefineCommand<T extends RESTPostAPIChatInputApplicationCommandsJSONBody> =
  {[K in keyof T]: T[K]}

export const defineCommand = <
  T extends RESTPostAPIChatInputApplicationCommandsJSONBody
>(
  // init: {[K in keyof T]: T[K]}, // WTF: it works but why?
  init: DefineCommand<T>,
  executor: (c: T) => {
    command?(
      ctx: InteractionContext<APIApplicationCommandInteraction>
    ): APIInteractionResponse
  }
) => {
  const command = commandScheme.passthrough().parse(init) as T
  return {...command, executor}
}

export class InteractionContext<T extends APIInteraction> {
  constructor(readonly interaction: T) {}

  /** send a message in response */
  reply(
    data: APIInteractionResponseCallbackData
  ): APIInteractionResponseChannelMessageWithSource {
    return {
      type: InteractionResponseType.ChannelMessageWithSource,
      data,
    }
  }
}

// =======================
type Cfg<T extends RESTPostAPIChatInputApplicationCommandsJSONBody[]> =
  T extends RESTPostAPIChatInputApplicationCommandsJSONBody[]
    ? T[number]
    : never

type CfgName<T extends RESTPostAPIChatInputApplicationCommandsJSONBody[]> =
  Cfg<T>['name']

type OptionsContext<T extends APIApplicationCommandOption> = {
  get(name: T['name']): void
}

type ParseOption<T extends APIApplicationCommandOption> = OptionsContext<T>


// type T = ParseOption<{
//   type: ApplicationCommandOptionType.String
//   name: 'str'
//   description: 'str'
// }>

// export type InteractionHandler<
//   T extends RESTPostAPIChatInputApplicationCommandsJSONBody[]
// > = Record<CfgName<T>, unknown>

// type Handler = InteractionHandler<[Test1, Test2]>

// const handler = <T extends RESTPostAPIChatInputApplicationCommandsJSONBody[]>(
//   commands: T,
//   handler: InteractionHandler<T>
// ) => {
//   return handler
// }

// handler(
//   [
//     {name: 'test', description: 'test'},
//     {name: 'test2', description: 'test2'},
//   ] as [Test1, Test2],
//   {
//     test: '',
//     test2: ''
//   }
// )
