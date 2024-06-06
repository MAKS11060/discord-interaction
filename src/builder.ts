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
  RESTPostAPIApplicationCommandsJSONBody,
  RESTPostAPIContextMenuApplicationCommandsJSONBody,
} from 'npm:discord-api-types/v10'
import {commandSchema, userCommandSchema} from './schema.ts'
import {CommandScheme, ContextMenuCommandScheme, EmptyArray, Handler, OptionToObject, UnionToIntersection, Unpack} from './types.ts'
import { associateBy } from "jsr:@std/collections@^0.224.0/associate-by";

// const toArr = <const T extends APIApplicationCommandOption[]>(input: T) => input
// const op = toArr([
//   {type: ApplicationCommandOptionType.String, name: 'str', description: '1'},
//   {type: ApplicationCommandOptionType.Integer, name: 'int', description: '2'},
// ])
// const o: OptionToObject<Unpack<typeof op>> = associateBy(op, (el) => el.name)

// console.log(o.int.name)

const validateCommand = <T extends RESTPostAPIApplicationCommandsJSONBody>(command: T): T => {
  if (command.type === undefined || command.type === ApplicationCommandType.ChatInput) {
    return commandSchema.passthrough().parse(command) as unknown as T
  } else if (command.type === ApplicationCommandType.Message || command.type === ApplicationCommandType.User) {
    return userCommandSchema.passthrough().parse(command) as T
  }
  return commandSchema.passthrough().parse(command) as unknown as T
}

export const defineCommand = <const T extends RESTPostAPIApplicationCommandsJSONBody>(command: T) => {
  command = validateCommand(command)

  return {
    command,
    createHandler(handler: DefineHandler<T>) {
      return {command, handler}
    },
  }
}

export type DefineHandler<T extends RESTPostAPIApplicationCommandsJSONBody> =
  T extends RESTPostAPIChatInputApplicationCommandsJSONBody
    ? CommandScheme<T>
    : T extends RESTPostAPIContextMenuApplicationCommandsJSONBody
    ? ContextMenuCommandScheme<T>
    : never
