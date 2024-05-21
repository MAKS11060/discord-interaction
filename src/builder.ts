import {
  APIApplicationCommandAttachmentOption,
  APIApplicationCommandBooleanOption,
  APIApplicationCommandChannelOption,
  APIApplicationCommandIntegerOption,
  APIApplicationCommandInteractionDataAttachmentOption,
  APIApplicationCommandInteractionDataBooleanOption,
  APIApplicationCommandInteractionDataChannelOption,
  APIApplicationCommandInteractionDataIntegerOption,
  APIApplicationCommandInteractionDataMentionableOption,
  APIApplicationCommandInteractionDataRoleOption,
  APIApplicationCommandInteractionDataStringOption,
  APIApplicationCommandInteractionDataUserOption,
  APIApplicationCommandMentionableOption,
  APIApplicationCommandOption,
  APIApplicationCommandRoleOption,
  APIApplicationCommandStringOption,
  APIApplicationCommandSubcommandGroupOption,
  APIApplicationCommandSubcommandOption,
  ApplicationCommandOptionType,
  APIApplicationCommandUserOption,
  ApplicationCommandType,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  APIInteractionResponse,
  InteractionResponseType,
  APIInteractionResponseCallbackData,
  APIInteractionResponseChannelMessageWithSource,
  APIInteractionResponseUpdateMessage,
  APIApplicationCommandBasicOption,
} from 'npm:discord-api-types/v10'
import {commandSchema, userCommandSchema} from './schema.ts'
import {EmptyArray, UnionToIntersection, Unpack} from './types.ts'
import {associateBy} from '@std/collections'

// const toArr = <const T extends APIApplicationCommandOption[]>(input: T) => input
// const op = toArr([
//   {type: ApplicationCommandOptionType.String, name: 'str', description: '1'},
//   {type: ApplicationCommandOptionType.Integer, name: 'int', description: '2'},
// ])
// const o: OptionToObject<Unpack<typeof op>> = associateBy(op, (el) => el.name)

const validateCommand = <T extends RESTPostAPIChatInputApplicationCommandsJSONBody>(command: T): T => {
  if (command.type === undefined || command.type === ApplicationCommandType.ChatInput) {
    return commandSchema.passthrough().parse(command) as T
  } else if (command.type === ApplicationCommandType.Message || command.type === ApplicationCommandType.User) {
    return userCommandSchema.passthrough().parse(command) as T
  }
  return commandSchema.passthrough().parse(command) as T
}

export const defineCommand = <const T extends RESTPostAPIChatInputApplicationCommandsJSONBody>(command: T) => {
  command = validateCommand(command)

  return {
    command,
    createHandler(handler: DefineHandler<T>) {
      return {
        command, /* : validateCommand(command), */
        handler,
      }
    },
  }
}

type isType<T extends APIApplicationCommandOption, Type extends ApplicationCommandOptionType> = T extends T & {
  type: Type
}
  ? T
  : never

type OptionToObject<T extends APIApplicationCommandOption> = {
  [K in T['name']]: T extends {name: K} ? T : never
}

// export class CommandCtx2<
//   C extends RESTPostAPIChatInputApplicationCommandsJSONBody | APIApplicationCommandOption,
//   T extends APIApplicationCommandOption
// > {
//   command: C
//   options: OptionToObject<T>
//   constructor(command: C, options?: OptionToObject<T>) {
//     this.command = command || {} as any
//     this.options = options || {} as any
//   }
// }

export class CommandCtx<
  C extends RESTPostAPIChatInputApplicationCommandsJSONBody | APIApplicationCommandOption,
  T extends APIApplicationCommandOption
> {
  command: C = {} as any
  options: T[]
  constructor(command: C, options?: T[]) {
    this.command = command
    this.options = options || []
  }

  getOption<K extends T['name']>(name: K): T extends {name: K} ? T : never {
    return this.options.find((option) => option.name === name) as any
  }

  getString<K extends isType<T, ApplicationCommandOptionType.String>['name']>(
    name: K
  ): T extends {name: K} ? T : never {
    return this.options.find(
      (option) => option.type === ApplicationCommandOptionType.String && option.name === name
    ) as any
  }

  getInteger<K extends isType<T, ApplicationCommandOptionType.Integer>['name']>(
    name: K
  ): T extends {name: K} ? T : never {
    return this.options.find(
      (option) => option.type === ApplicationCommandOptionType.Integer && option.name === name
    ) as any
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
}

export type Handler<T> = (c: T) => APIInteractionResponse | Promise<APIInteractionResponse>

export type DefineHandler<T extends RESTPostAPIChatInputApplicationCommandsJSONBody> = UnionToIntersection<
  CommandScheme<T>
>

type CommandScheme<T extends RESTPostAPIChatInputApplicationCommandsJSONBody> =
  T['options'] extends APIApplicationCommandOption[] & EmptyArray<T['options']>
    ? T['options'] extends Array<infer O> // 0
      ? O extends APIApplicationCommandBasicOption
        ? {[K in T['name']]: Handler<CommandCtx<T, Unpack<T['options']>>>} // 0(1)
        : O extends APIApplicationCommandSubcommandOption
        ? {
            [K in T['name']]: {
              [N in O['name']]: Handler<CommandCtx<O, Unpack<O['options']>>> // 1(2)
            }
          }
        : O extends APIApplicationCommandSubcommandGroupOption
        ? {
            [K in T['name']]: {
              [N in O['name']]: O['options'] extends Array<infer S>
                ? S extends APIApplicationCommandSubcommandOption
                  ? {[K in S['name']]: Handler<CommandCtx<S, Unpack<S['options']>>>} // 2(3)
                  : 2
                : 3
            }
          }
        : 1
      : {[K in T['name']]: Handler<CommandCtx<T, never>>}
    : {[K in T['name']]: Handler<CommandCtx<T, never>>}


// defineCommand({
//   name: 'test',
//   description: 'a',
// }).createHandler({
//   test: (c) => {
//     c.command.name === 'test'
//     return c.reply({content: 'main'})
//   },
// })
// defineCommand({
//   name: 'test2',
//   description: 'a',
//   options: [
//     {type: ApplicationCommandOptionType.String, name: 'str', description: '1'},
//     {type: ApplicationCommandOptionType.Integer, name: 'int', description: '2'},
//   ],
// }).createHandler({
//   test2: (c) => {
//     c.command.name === 'test2'
//     c.getOption('str').type === ApplicationCommandOptionType.String
//     c.getOption('str').name === 'str'

//     c.getString('str')
//     c.getInteger('int')

//     return c.reply({content: 'main'})
//   },
// })

// defineCommand({
//   name: 'test2',
//   description: 'a',
//   options: [
//     {type: ApplicationCommandOptionType.String, name: 'str', description: '1'},
//     {type: ApplicationCommandOptionType.Integer, name: 'int', description: '2'},
//   ],
// }).createHandler({
//   test2: (c) => {
//     c.command.name === 'test2'
//     c.getOption('str').type === ApplicationCommandOptionType.String
//     c.getOption('str').name === 'str'
//     return c.reply({content: 'main'})
//   },
// })

// defineCommand({
//   name: 'test',
//   description: 'a',
//   options: [
//     {
//       type: ApplicationCommandOptionType.Subcommand,
//       name: 'sub',
//       description: '1',
//       options: [
//         {type: ApplicationCommandOptionType.String, name: 'str', description: '1'},
//         {type: ApplicationCommandOptionType.Integer, name: 'int', description: '2'},
//       ],
//     },
//   ],
// }).createHandler({
//   test: {
//     sub: (c) => {
//       c.getInteger('int')
//       c.getOption('str')
//       return c.reply({content: ''})
//     },
//   },
// })

// defineCommand({
//   name: 'test', // 0
//   description: 'a',
//   options: [
//     {
//       name: 'sub group', // 1
//       description: 's-g',
//       type: ApplicationCommandOptionType.SubcommandGroup,
//       options: [
//         {
//           type: ApplicationCommandOptionType.Subcommand,
//           name: 'sub', // 2
//           description: '1',
//           options: [
//             {type: ApplicationCommandOptionType.String, name: 'str', description: '1'},
//             {type: ApplicationCommandOptionType.Integer, name: 'int', description: '2'},
//           ],
//         },
//         {
//           type: ApplicationCommandOptionType.Subcommand,
//           name: 'sub2', // 2
//           description: '1',
//           options: [
//             {type: ApplicationCommandOptionType.Boolean, name: 'bool', description: '1'},
//             {type: ApplicationCommandOptionType.User, name: 'user', description: '2'},
//           ],
//         },
//         {
//           type: ApplicationCommandOptionType.Subcommand,
//           name: 'sub3', // 2
//           description: '1',
//           options: [],
//         },
//       ],
//     },
//   ],
// }).createHandler({
//   test: {
//     'sub group': {
//       sub: (c) => {
//         c.getInteger('int')
//         return c.reply({content: ''})
//       },
//       sub2: (c) => {
//         c.getOption('bool')
//         c.getOption('user')
//         return c.reply({content: ''})
//       },
//       sub3: (c) => {
//         return c.reply({content: ''})
//       },
//     },
//   },
// })
