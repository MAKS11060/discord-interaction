import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
} from 'npm:discord-api-types/v10'
import {defineCommand} from './builder.ts'

const test = defineCommand(
  {
    type: ApplicationCommandType.ChatInput,
    name: 'test',
    description: 'Test command',
    options: [
      {
        type: ApplicationCommandOptionType.String,
        name: 'str',
        description: 'str',
      },
      {
        type: ApplicationCommandOptionType.Number,
        name: 'num',
        description: 'num',
      },
      {
        type: ApplicationCommandOptionType.Boolean,
        name: 'bool',
        description: 'bool',
      },
      {
        type: ApplicationCommandOptionType.User,
        name: 'user',
        description: 'sel user',
      },
    ],
  },
  (c) => {
    c.name === 'test'

    return {
      command(ctx) {
        return ctx.reply({content: 'test ok'})
      },
    }
  }
)

export const commands = [test]
