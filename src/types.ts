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
  RESTPostAPIChatInputApplicationCommandsJSONBody
} from 'discord-api-types/v10'

// {} | {} => {} & {}
type UnionToIntersection<U> = (U extends any ? (arg: U) => void : never) extends (arg: infer R) => void ? R : never

type ExtractOption<T extends APIApplicationCommandOption[] | undefined> = T extends unknown[] ? T[number] : T

type ParseOption<T extends APIApplicationCommandOption | undefined> = T extends APIApplicationCommandSubcommandOption
  ? T extends {required: true}
    ? {[K in T['name']]: UnionToIntersection<ParseOption<ExtractOption<T['options']>>>}
    : {[K in T['name']]?: UnionToIntersection<ParseOption<ExtractOption<T['options']>>>}
  : T extends APIApplicationCommandSubcommandGroupOption
  ? T extends {required: true}
    ? {[K in T['name']]: UnionToIntersection<ParseOption<ExtractOption<T['options']>>>}
    : {[K in T['name']]?: UnionToIntersection<ParseOption<ExtractOption<T['options']>>>}
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

// const test1 = defineCommand({
//   type: ApplicationCommandType.ChatInput,
//   name: 'test',
//   description: '',
//   options: [
//     {
//       type: ApplicationCommandOptionType.Number,
//       name: 'num',
//       description: 'num',
//       required: true,
//     },
//     {
//       type: ApplicationCommandOptionType.Number,
//       name: 'num-2',
//       description: 'num 2',
//     },
//     {
//       type: ApplicationCommandOptionType.Subcommand,
//       name: 'sub-1',
//       description: 'sub',
//       options: [
//         {
//           type: ApplicationCommandOptionType.Boolean,
//           name: 'bool',
//           description: 'bool',
//         },
//       ],
//     },
//   ],
// }).command
// const test2 = defineCommand({
//   type: ApplicationCommandType.ChatInput,
//   name: 'test',
//   description: '',
//   options: [
//     {
//       type: ApplicationCommandOptionType.Subcommand,
//       name: 'sub',
//       description: 'sub',
//       options: [
//         {
//           type: ApplicationCommandOptionType.String,
//           name: 'str',
//           description: 'str',
//         },
//       ],
//     },
//     {
//       type: ApplicationCommandOptionType.SubcommandGroup,
//       name: 'sub g',
//       description: 'sub g',
//       options: [
//         {
//           type: ApplicationCommandOptionType.Subcommand,
//           name: 'sub 2',
//           description: 'sub 2',
//           options: [
//             {
//               type: ApplicationCommandOptionType.Number,
//               name: 'num',
//               description: 'num',
//             },
//             {
//               type: ApplicationCommandOptionType.Number,
//               name: 'num-2',
//               description: 'num 2',
//             },
//           ],
//         },
//       ],
//     },
//   ],
// }).command
// const test3 = defineCommand({
//   type: ApplicationCommandType.ChatInput,
//   name: 'test',
//   description: '',
//   options: [
//     {
//       type: ApplicationCommandOptionType.Subcommand,
//       name: 'sub',
//       description: 'sub',
//       required: true,
//       options: [
//         {
//           type: ApplicationCommandOptionType.String,
//           name: 'str2',
//           description: 'str2',
//           required: true,
//         },
//         {
//           type: ApplicationCommandOptionType.Integer,
//           name: 'int',
//           description: 'int',
//         },
//         {
//           type: ApplicationCommandOptionType.String,
//           name: 'str2',
//           description: 'str2',
//           required: true,
//         },
//         {
//           type: ApplicationCommandOptionType.String,
//           name: 'str',
//           description: 'str',
//         },
//       ],
//     },
//     {
//       type: ApplicationCommandOptionType.Subcommand,
//       name: 's2',
//       description: 's2'
//     }
//     // {
//     //   type: ApplicationCommandOptionType.Integer,
//     //   name: 'int',
//     //   description: 'int',
//     // },
//     // {
//     //   type: ApplicationCommandOptionType.String,
//     //   name: 'str2',
//     //   description: 'str2',
//     //   required: true,
//     // },
//     // {
//     //   type: ApplicationCommandOptionType.String,
//     //   name: 'str',
//     //   description: 'str',
//     // },
//   ],
// }).command

// type A = CommandToScheme<typeof test3>
// type B = A['sub']['int']

// ================================================================== TODO
// export enum InteractionContextTypes {
//   /**
//    * Interaction can be used within servers
//    */
//   GUILD = 0,
//   /**
//    * Interaction can be used within DMs with the app's bot user
//    */
//   BOT_DM = 1,
//   /**
//    * Interaction can be used within Group DMs and DMs other than the app's bot user
//    */
//   PRIVATE_CHANNEL = 2,
// }

// export enum InteractionInstallContextTypes {
//   /**
//    * App is installable to servers
//    */
//   GUILD_INSTALL = 0,
//   /**
//    * App is installable to users
//    */
//   USER_INSTALL = 1,
// }
