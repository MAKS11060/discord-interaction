import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  Locale,
} from 'discord-api-types/v10'
import {z} from 'zod'

export const commandName = z.string().min(1).max(32)

export const chatInputName = commandName
  .regex(
    /^[-_\p{L}\p{N}\p{sc=Deva}\p{sc=Thai}]{1,32}$/u,
    'https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-naming'
  )
  .refine((v) => v === v.toLocaleLowerCase(), `name must be lower case`)

export const descriptionScheme = z.string().min(1).max(100)

export const commandOptionsScheme = z
  .array(
    z.object({
      type: z.nativeEnum(ApplicationCommandOptionType),
      name: chatInputName,
      description: descriptionScheme,
      name_localizations: z
        .record(z.nativeEnum(Locale), chatInputName)
        .optional(),
      description_localizations: z
        .record(z.nativeEnum(Locale), descriptionScheme)
        .optional(),
    }).passthrough()
  )
  .max(25)

export const commandScheme = z.object({
  name: chatInputName,
  name_localizations: z.record(z.nativeEnum(Locale), chatInputName).optional(),
  description: descriptionScheme,
  description_localizations: z
    .record(z.nativeEnum(Locale), descriptionScheme)
    .optional(),
  options: commandOptionsScheme.optional(),
  nsfw: z.boolean().optional(),
})

/** {@linkcode ApplicationCommandType.ChatInput} */
export const commandsScheme = z.array(commandScheme).max(100)

/** {@linkcode ApplicationCommandType.User} */
export const userCommandsScheme = z
  .array(
    commandScheme.omit({
      description: true,
      options: true,
    })
  )
  .max(5)

/** {@linkcode ApplicationCommandType.Message} */
export const messageCommandsScheme = z
  .array(
    commandScheme.omit({
      description: true,
      options: true,
    })
  )
  .max(5)
