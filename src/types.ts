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
  APIApplicationCommandInteractionDataSubcommandGroupOption,
  APIApplicationCommandInteractionDataSubcommandOption,
  APIApplicationCommandInteractionDataUserOption,
  APIApplicationCommandMentionableOption,
  APIApplicationCommandOption,
  APIApplicationCommandRoleOption,
  APIApplicationCommandStringOption,
  APIApplicationCommandSubcommandGroupOption,
  APIApplicationCommandSubcommandOption,
  APIApplicationCommandUserOption,
  ApplicationCommandOptionType,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord-api-types/v10'
import {defineCommand} from './builder.ts'

// {} | {} => {} & {}
export type UnionToIntersection<U> = (U extends any ? (arg: U) => void : never) extends (arg: infer R) => void ? R : never

export type ExtractOption<T extends APIApplicationCommandOption[] | undefined> = T extends unknown[] ? T[number] : T


type ParseOption<T extends APIApplicationCommandOption | undefined> = T extends APIApplicationCommandSubcommandOption
  ? T extends {required: true}
    ? {
        [K in T['name']]: APIApplicationCommandInteractionDataSubcommandOption &
          UnionToIntersection<ParseOption<ExtractOption<T['options']>>>
      }
    : {
        [K in T['name']]?: APIApplicationCommandInteractionDataSubcommandOption &
          UnionToIntersection<ParseOption<ExtractOption<T['options']>>>
      }
  : T extends APIApplicationCommandSubcommandGroupOption
  ? T extends {required: true}
    ? {
        [K in T['name']]: APIApplicationCommandInteractionDataSubcommandGroupOption &
          UnionToIntersection<ParseOption<ExtractOption<T['options']>>>
      }
    : {
        [K in T['name']]?: APIApplicationCommandInteractionDataSubcommandGroupOption &
          UnionToIntersection<ParseOption<ExtractOption<T['options']>>>
      }
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

export type CommandToScheme<T extends RESTPostAPIChatInputApplicationCommandsJSONBody> = UnionToIntersection<Scheme<T>>

// ==================================================================
// type A = CommandToScheme<typeof test>
// type B = A['post']

// const test = defineCommand({
//   name: 'art',
//   description: 'Get anime art',
//   options: [
//     {
//       type: ApplicationCommandOptionType.Subcommand,
//       name: 'random',
//       description: 'Get random art',
//     },
//     {
//       type: ApplicationCommandOptionType.Subcommand,
//       name: 'fav',
//       description: 'User random favorites',
//       options: [
//         {
//           type: ApplicationCommandOptionType.String,
//           name: 'user',
//           description: 'username',
//           required: true,
//           max_length: 80,
//           autocomplete: true,
//         },
//       ],
//     },
//     {
//       type: ApplicationCommandOptionType.Subcommand,
//       name: 'post',
//       description: 'Post by id',
//       options: [
//         {
//           type: ApplicationCommandOptionType.Number,
//           name: 'id',
//           description: 'Post id',
//           required: true,
//         },
//       ],
//     },
//   ],
// }).command

// ==================================================================
// const app = defineCommand({
//   name: 'app',
//   description: ''
// }).command

// type T = CommandToScheme2<typeof app>

// type ParseOption2<T extends APIApplicationCommandOption> = T

// type Scheme2<T extends RESTPostAPIChatInputApplicationCommandsJSONBody> = T['options'] extends Array<infer O>
//   ? O extends APIApplicationCommandOption
//     ? ParseOption2<O>
//     : never
//   : never
// export type CommandToScheme2<T extends RESTPostAPIChatInputApplicationCommandsJSONBody> = UnionToIntersection<Scheme2<T>>

// type Obj = {
//   name: 'str',

// }

