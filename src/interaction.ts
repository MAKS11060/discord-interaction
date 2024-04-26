import {
  APIInteraction,
  APIInteractionResponse,
  InteractionResponseType,
  InteractionType,
  MessageFlags,
} from 'discord-api-types/v10'
import {createFactory, createMiddleware} from 'hono/factory'
import {DefineCommand, InteractionContext} from './builder.ts'
import {verifyRequestSignature} from './lib/ed25519.ts'
import {loggerBody} from './lib/helper.ts'

/*
[discord] --> [Server]
            verify request
          handle interaction

const c = defineCommand()
const handler = c.execute() // init command
handler(interaction)
 */

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

const errorCommand = (text: string) => {
  const r: APIInteractionResponse = {
    type: InteractionResponseType.ChannelMessageWithSource,
    data: {
      content: text,
      flags: MessageFlags.Ephemeral,
    },
  }
  return Response.json(r)
}

export const discordInteraction = <T extends DefineCommand[]>(
  key: CryptoKey,
  commands: T
) => {
  // commands.map((c) => {})
  // const nameMap = new Map<string, T[number]>()
  // for (const command of commands) {
  //   nameMap.set(command.name, command)
  // }
  // console.log(nameMap)

  // prepare
  const list = commands.map(({executor, ...command}) => {
    return {
      command,
      handlers: executor(command),
    }
  })

  const interactionHandler = createMiddleware(async (c) => {
    const interaction = await c.req.json<APIInteraction>()

    if (interaction.type === InteractionType.Ping) {
      return Response.json({
        type: InteractionResponseType.Pong,
      } as APIInteractionResponse)
    }

    if (interaction.type === InteractionType.ApplicationCommand) {
      for (const {command, handlers} of list) {
        if (!handlers.command)
          return errorCommand('command handler is undefined')

        if (interaction.data.name === command.name) {
          const ctx = new InteractionContext(interaction)
          return c.json(await handlers.command(ctx))
        }
      }
    }

    if (interaction.type === InteractionType.MessageComponent) {
      return unknownCommand()
    }

    if (interaction.type === InteractionType.ApplicationCommandAutocomplete) {
      return unknownCommand()
    }

    if (interaction.type === InteractionType.ModalSubmit) {
      return unknownCommand()
    }

    return unknownCommand()
  })

  return createFactory().createHandlers(
    verifyRequestSignature(key),
    loggerBody<APIInteraction>({
      logFn: ({type, data, member, ...int}) => {
        console.log(InteractionType[type], data)
        console.log(int)
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
