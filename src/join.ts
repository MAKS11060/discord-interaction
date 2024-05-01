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
  APIApplicationCommandUserOption,
  ApplicationCommandOptionType,
  ApplicationCommandType,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord-api-types/v10'
import {defineCommand} from './builder.ts'

/* const test1 = defineCommand({
  type: ApplicationCommandType.ChatInput,
  name: 'test',
  description: '',
  options: [
    {
      type: ApplicationCommandOptionType.Number,
      name: 'num',
      description: 'num',
      required: true,
    },
    {
      type: ApplicationCommandOptionType.Number,
      name: 'num-2',
      description: 'num 2',
    },
    {
      type: ApplicationCommandOptionType.Subcommand,
      name: 'sub-1',
      description: 'sub',
      options: [
        {
          type: ApplicationCommandOptionType.Boolean,
          name: 'bool',
          description: 'bool',
        },
      ],
    },
  ],
}).command
const test2 = defineCommand({
  type: ApplicationCommandType.ChatInput,
  name: 'test',
  description: '',
  options: [
    {
      type: ApplicationCommandOptionType.Subcommand,
      name: 'sub',
      description: 'sub',
      options: [
        {
          type: ApplicationCommandOptionType.String,
          name: 'str',
          description: 'str',
        },
      ],
    },
    {
      type: ApplicationCommandOptionType.SubcommandGroup,
      name: 'sub g',
      description: 'sub g',
      options: [
        {
          type: ApplicationCommandOptionType.Subcommand,
          name: 'sub 2',
          description: 'sub 2',
          options: [
            {
              type: ApplicationCommandOptionType.Number,
              name: 'num',
              description: 'num',
            },
            {
              type: ApplicationCommandOptionType.Number,
              name: 'num-2',
              description: 'num 2',
            },
          ],
        },
      ],
    },
  ],
}).command
const test3 = defineCommand({
  type: ApplicationCommandType.ChatInput,
  name: 'test',
  description: '',
  options: [
    {
      type: ApplicationCommandOptionType.Subcommand,
      name: 'sub',
      description: 'sub',
      required: true,
      options: [
        {
          type: ApplicationCommandOptionType.String,
          name: 'str2',
          description: 'str2',
          required: true,
        },
        {
          type: ApplicationCommandOptionType.Integer,
          name: 'int',
          description: 'int',
        },
        {
          type: ApplicationCommandOptionType.String,
          name: 'str2',
          description: 'str2',
          required: true,
        },
        {
          type: ApplicationCommandOptionType.String,
          name: 'str',
          description: 'str',
        },
      ],
    },
    // {
    //   type: ApplicationCommandOptionType.Integer,
    //   name: 'int',
    //   description: 'int',
    // },
    // {
    //   type: ApplicationCommandOptionType.String,
    //   name: 'str2',
    //   description: 'str2',
    //   required: true,
    // },
    // {
    //   type: ApplicationCommandOptionType.String,
    //   name: 'str',
    //   description: 'str',
    // },
  ],
}).command

type A = Scheme<typeof test3>
type B = A['sub']

type ExtractOption<T extends APIApplicationCommandOption[] | undefined> = T extends unknown[] ? T[number] : T

type ParseOption<T extends APIApplicationCommandOption | undefined> = T extends APIApplicationCommandSubcommandOption
  ? T extends {required: true}
    ? {[K in T['name']]: ParseOption<ExtractOption<T['options']>>}
    : {[K in T['name']]?: ParseOption<ExtractOption<T['options']>>}
  : T extends APIApplicationCommandSubcommandGroupOption
  ? T extends {required: true}
    ? {[K in T['name']]: ParseOption<ExtractOption<T['options']>>}
    : {[K in T['name']]?: ParseOption<ExtractOption<T['options']>>}
  : T extends APIApplicationCommandStringOption
  ? T extends {required: true}
    ? {[K in T['name']]: APIApplicationCommandInteractionDataStringOption}
    : {[K in T['name']]?: APIApplicationCommandInteractionDataStringOption}
  : T extends APIApplicationCommandIntegerOption
  ? T extends {required: true}
    ? {[K in T['name']]: APIApplicationCommandInteractionDataIntegerOption}
    : {[K in T['name']]?: APIApplicationCommandInteractionDataIntegerOption}
  : T extends APIApplicationCommandBooleanOption
  ? T extends {required: true}
    ? {[K in T['name']]: APIApplicationCommandInteractionDataBooleanOption}
    : {[K in T['name']]?: APIApplicationCommandInteractionDataBooleanOption}
  : T extends APIApplicationCommandUserOption
  ? T extends {required: true}
    ? {[K in T['name']]: APIApplicationCommandInteractionDataUserOption}
    : {[K in T['name']]?: APIApplicationCommandInteractionDataUserOption}
  : T extends APIApplicationCommandChannelOption
  ? T extends {required: true}
    ? {[K in T['name']]: APIApplicationCommandInteractionDataChannelOption}
    : {[K in T['name']]?: APIApplicationCommandInteractionDataChannelOption}
  : T extends APIApplicationCommandRoleOption
  ? T extends {required: true}
    ? {[K in T['name']]: APIApplicationCommandInteractionDataRoleOption}
    : {[K in T['name']]?: APIApplicationCommandInteractionDataRoleOption}
  : T extends APIApplicationCommandMentionableOption
  ? T extends {required: true}
    ? {[K in T['name']]: APIApplicationCommandInteractionDataMentionableOption}
    : {[K in T['name']]?: APIApplicationCommandInteractionDataMentionableOption}
  : T extends APIApplicationCommandAttachmentOption
  ? T extends {required: true}
    ? {[K in T['name']]: APIApplicationCommandInteractionDataAttachmentOption}
    : {[K in T['name']]?: APIApplicationCommandInteractionDataAttachmentOption}
  : never

type Scheme<T extends RESTPostAPIChatInputApplicationCommandsJSONBody> = T['options'] extends Array<infer O>
  ? O extends APIApplicationCommandOption
    ? ParseOption<O>
    : never
  : never
 */

// type FlatOptions<T extends APIApplicationCommandOption[] | undefined> = T extends Array<infer E>
//   ? E extends APIApplicationCommandBasicOption
//     ? E['name']
//     : E extends APIApplicationCommandSubcommandOption
//     ? FlatOptions<E['options']>
//     : never
//   : never

// type T = FlatOptions<(typeof test1)['options']>

// type FlattenObjectKeys<T extends Record<string, unknown>, Key = keyof T> = Key extends string
//   ? T[Key] extends Record<string, unknown>
//     ? `${Key}.${FlattenObjectKeys<T[Key]>}`
//     : `${Key}`
//   : never

// type A<T extends typeof d> = T['options'] extends Array<infer E>
//   ? E extends APIApplicationCommandOption
//     ? FlatOptions<E>
//     : never
//   : never

// type T = A<typeof d>

// type ToScheme<> =

/* type S = {
  name: string
  arr?: S[]
}

type Scheme<T extends S> = {
  // [K in keyof T]: T[K] extends Array<infer A>
  //   ? A
  //   : T[K]
  [K in keyof T]: T[K]
}

type D = {name: '1'; arr: [{name: '2'}, {name: '3'}]}
type Result = Scheme<D>
const result = {
  '1': {name: '1'},
  '2': {name: '2'},
  '3': {name: '3'},
} */
