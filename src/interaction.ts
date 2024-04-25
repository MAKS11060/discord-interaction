import {createFactory, createMiddleware} from 'hono/factory'
import {
  APIInteraction,
  APIInteractionResponse,
  InteractionResponseType,
  InteractionType,
  MessageFlags,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'npm:discord-api-types/v10'
import {verifyRequestSignature} from './lib/ed25519.ts'
import {loggerBody} from './lib/helper.ts'

const unknownCommand = () => {
  const r: APIInteractionResponse = {
    type: InteractionResponseType.ChannelMessageWithSource,
    data: {
      content: 'Unknown command',
      flags: MessageFlags.Ephemeral,
    },
  }
  return Response.json(r)
}

export const discordInteraction = <
  T extends RESTPostAPIChatInputApplicationCommandsJSONBody[]
>(
  key: CryptoKey,
  commands: T
) => {
  // commands.map((c) => {})
  const nameMap = new Map<string, T[number]>()

  for (const command of commands) {
    // for (const c of command?.options) {
    // c.type === ApplicationCommandOptionType.Subcommand
    // }
    nameMap.set(command.name, command)
  }
  console.log(nameMap)

  const interactionHandler = createMiddleware(async (c, next) => {
    const interaction = await c.req.json<APIInteraction>()

    if (interaction.type === InteractionType.Ping) {
      return Response.json({
        type: InteractionResponseType.Pong,
      } as APIInteractionResponse)
    }

    if (interaction.type === InteractionType.ApplicationCommand) {
    }

    if (interaction.type === InteractionType.ApplicationCommandAutocomplete) {
    }

    if (interaction.type === InteractionType.MessageComponent) {
    }

    if (interaction.type === InteractionType.ModalSubmit) {
    }

    return unknownCommand()
  })

  return createFactory().createHandlers(
    verifyRequestSignature(key),
    loggerBody<APIInteraction>({
      logFn: ({type, data, member}) => {
        console.log(InteractionType[type], data)
      },
    }),
    interactionHandler
  )
}

// {
//   type Command<T extends RESTPostAPIApplicationCommandsJSONBody> = T
//   // type Config = Command<{
//   //   type: ApplicationCommandType.ChatInput
//   //   name: 'test'
//   //   description: 'test'
//   // }>

//   // const makeOptions = <T extends APIApplicationCommandOption[]>(options: T) =>
//   //   options
//   // const options = makeOptions([
//   //   {
//   //     type: ApplicationCommandOptionType.Boolean,
//   //     name: 'bool',
//   //     description: 'bool',
//   //   },
//   // ])

//   type ParseOptions<T extends APIApplicationCommandOption[]> =
//     T extends APIApplicationCommandOption[] ? T[number] : never

//   type T = ParseOptions<
//     [
//       {
//         type: ApplicationCommandOptionType.Boolean
//         name: 'bool'
//         description: 'bool'
//       },
//       {
//         type: ApplicationCommandOptionType.Boolean
//         name: 'bool 2'
//         description: 'bool 2',
//       }
//     ]
//   >

//   type Config<T extends Record<string, unknown>> = {
//     [K in keyof T]: {
//       command: Omit<RESTPostAPIChatInputApplicationCommandsJSONBody, 'name'> & {
//         name: K
//       }
//       // handler: (command: T[K]) => void
//     }
//   }

//   const defineCommand = <T extends Record<string, unknown>>(config: Config<T>) =>
//     config

//   defineCommand({
//     help: {
//       command: {
//         name: 'help',
//         description: '',
//         // type: ApplicationCommandType.ChatInput,
//       },
//     },
//   })
// }
