import {ApplicationCommandOptionType, Locale} from 'npm:discord-api-types/v10'
import {z} from 'npm:zod'

export const ChatInputName = z
  .string()
  .min(1)
  .max(32)
  .regex(
    /^[-_\p{L}\p{N}\p{sc=Deva}\p{sc=Thai}]{1,32}$/u,
    'https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-naming'
  )
  .refine(v => v === v.toLocaleLowerCase(), `name must be lower case`)

export const descriptionScheme = z.string().min(1).max(100)

export const commandOptionsScheme = z
  .array(
    z.object({
      type: z.nativeEnum(ApplicationCommandOptionType),
      name: ChatInputName,
      description: descriptionScheme,
      name_localizations: z
        .record(z.nativeEnum(Locale), ChatInputName)
        .optional(),
      description_localizations: z
        .record(z.nativeEnum(Locale), descriptionScheme)
        .optional(),
    })
  )
  .max(25)

export const commandScheme = z.object({
  name: ChatInputName,
  name_localizations: z.record(z.nativeEnum(Locale), ChatInputName).optional(),
  description: descriptionScheme,
  description_localizations: z
    .record(z.nativeEnum(Locale), descriptionScheme)
    .optional(),
  options: commandOptionsScheme.optional(),
  nsfw: z.boolean().optional(),
})

export const commandsScheme = z.array(commandScheme).max(100)
