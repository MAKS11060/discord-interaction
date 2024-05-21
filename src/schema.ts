import {ApplicationCommandOptionType, ApplicationCommandType, Locale} from 'discord-api-types/v10'
import {z} from 'zod'

export const commandName = z.string().min(1).max(32)

export const chatInputName = commandName
  .regex(
    /^[-_\p{L}\p{N}\p{sc=Deva}\p{sc=Thai}]{1,32}$/u,
    'https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-naming'
  )
  .refine((v) => v === v.toLocaleLowerCase(), `name must be in lowercase`)

export const descriptionSchema = z.string().min(1).max(100)

export const commandOptionSchema = z
  .object({
    type: z.nativeEnum(ApplicationCommandOptionType),
    name: chatInputName,
    name_localizations: z.record(z.nativeEnum(Locale), chatInputName).optional(),
    description: descriptionSchema,
    description_localizations: z.record(z.nativeEnum(Locale), descriptionSchema).optional(),
  })
  .passthrough()

const commandOptionSchemaRefine = (v: z.TypeOf<typeof commandOptionSchema>[]) => {
  const isContainsSubCommand = v.find((v) => ApplicationCommandOptionType.Subcommand === v.type)
  const isContainsSubCommandGroup = v.find((v) => ApplicationCommandOptionType.SubcommandGroup === v.type)
  const isContains = v.filter(
    (v) => ![ApplicationCommandOptionType.Subcommand, ApplicationCommandOptionType.SubcommandGroup].includes(v.type)
  )

  if (isContains.length && isContainsSubCommand) return false
  if (isContains.length && isContainsSubCommandGroup) return false
  if (isContainsSubCommand && isContainsSubCommandGroup) return false
  return true
}

// {                0 root
//   options: {     1 sub-group / sub
//     options: {   2 sub
//       options: { 3 options
//       }
//     }
//   }
// }
export const commandOptionsSchema = z // 1
  .array(
    commandOptionSchema.extend({
      options: z // 2
        .array(
          commandOptionSchema.extend({
            options: z // 3
              .array(commandOptionSchema)
              .max(25)
              .refine(
                commandOptionSchemaRefine,
                'Sub-command and sub-command group option types are mutually exclusive to all other types'
              )
              .optional(),
          })
        )
        .max(25)
        .refine(
          commandOptionSchemaRefine,
          'Sub-command and sub-command group option types are mutually exclusive to all other types'
        )
        .optional(),
    })
  )
  .max(25)
  // .refine(
  //   commandOptionSchemaRefine,
  //   'Sub-command and sub-command group option types are mutually exclusive to all other types'
  // )

export const commandSchema = z
  .object({
    type: z.nativeEnum(ApplicationCommandType).optional(),
    name: chatInputName,
    name_localizations: z.record(z.nativeEnum(Locale), chatInputName).optional(),
    description: descriptionSchema,
    description_localizations: z.record(z.nativeEnum(Locale), descriptionSchema).optional(),
    options: commandOptionsSchema.optional(),
    nsfw: z.boolean().optional(),
  })
  .passthrough()


export const userCommandSchema = commandSchema.omit({
  description: true,
  options: true,
})

export const messageCommandSchema = userCommandSchema

export const commandsScheme = z.array(commandSchema).max(100)
export const userCommandsSchema = z.array(messageCommandSchema).max(5)
export const messageCommandsSchema = z.array(messageCommandSchema).max(5)
