import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  MessageFlags,
} from 'discord-api-types/v10'
import {defineCommand} from './builder.ts'

const help = defineCommand(
  {
    name: 'help',
    description: 'Show help',
  },
  () => {
    return {
      command(c) {
        return c.reply({content: 'ok', flags: MessageFlags.Ephemeral})
      },
    }
  }
)

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
        type: ApplicationCommandOptionType.Integer,
        name: 'int',
        description: 'int',
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
      {
        type: ApplicationCommandOptionType.Channel,
        name: 'channel',
        description: 'Channel',
      },
      {
        type: ApplicationCommandOptionType.Role,
        name: 'role',
        description: 'Role',
      },
      {
        type: ApplicationCommandOptionType.Mentionable,
        name: 'mentionable',
        description: 'Mentionable',
      },
      {
        type: ApplicationCommandOptionType.Number,
        name: 'num',
        description: 'num',
      },
      {
        type: ApplicationCommandOptionType.Attachment,
        name: 'attachment',
        description: 'Attachment',
      },
    ],
  },
  () => {
    return {
      command(c) {
        return c.reply({
          content: `\`\`\`json\n${JSON.stringify(
            c.interaction.data,
            null,
            2
          )}\n\`\`\``,
        })
      },
    }
  }
)

const sub = defineCommand(
  {
    type: ApplicationCommandType.ChatInput,
    name: 'permissions',
    description: 'Get or edit permissions for a user or a role',
    options: [
      {
        type: ApplicationCommandOptionType.SubcommandGroup,
        name: 'user',
        description: 'Get or edit permissions for a user',
        options: [
          {
            type: ApplicationCommandOptionType.Subcommand,
            name: 'get',
            description: 'Get permissions for a user',
            options: [
              {
                name: 'user',
                description: 'The user to get',
                type: ApplicationCommandOptionType.User,
                required: true,
              },
              {
                name: 'channel',
                description:
                  'The channel permissions to get. If omitted, the guild permissions will be returned',
                type: ApplicationCommandOptionType.Channel,
                required: false,
              },
            ],
          },
          {
            name: 'edit',
            description: 'Edit permissions for a user',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
              {
                name: 'user',
                description: 'The user to edit',
                type: ApplicationCommandOptionType.User,
                required: true,
              },
              {
                name: 'channel',
                description:
                  'The channel permissions to edit. If omitted, the guild permissions will be edited',
                type: ApplicationCommandOptionType.Channel,
                required: false,
              },
            ],
          },
        ],
      },
    ],
  },
  () => {
    return {
      command(c) {
        return c.reply({content: 'ok'})
      },
    }
  }
)

export const commands = [help, test, sub]
