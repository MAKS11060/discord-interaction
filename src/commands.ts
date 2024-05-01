import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  ButtonStyle,
  ComponentType,
  MessageFlags,
} from 'discord-api-types/v10'
import {defineCommand} from './builder.ts'
import { Scheme } from "./types.ts";

const help = defineCommand({
  name: 'help',
  description: 'Show help',
}).createHandler(() => {
  return {
    command(c) {
      return c.reply({content: 'ok', flags: MessageFlags.Ephemeral})
    },
  }
})

const test = defineCommand({
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
    {
      type: ApplicationCommandOptionType.String,
      name: 'autocomplete',
      description: 'autocomplete',
      autocomplete: true,
    },
  ],
}).createHandler(() => {
  return {
    command(c) {
      return c.reply({
        content: `\`\`\`json\n${JSON.stringify(c.interaction.data, null, 2)}\n\`\`\``,
        components: [
          {
            type: ComponentType.ActionRow,
            components: [
              {
                type: ComponentType.Button,
                style: ButtonStyle.Danger,
                custom_id: '0',
                label: 'ER',
              },
            ],
          },
        ],
      })
    },
    messageComponent(c) {
      return c.replyUpdate({
        components: [
          {
            type: ComponentType.ActionRow,
            components: [
              {
                type: ComponentType.Button,
                style: ButtonStyle.Success,
                custom_id: '1',
                label: 'Ok',
              },
            ],
          },
        ],
      })
    },
    commandAutocomplete(c) {
      return c.autocomplete({
        choices: [
          {
            name: JSON.stringify(c.interaction.data.options).replaceAll('"', ' '),
            value: crypto.randomUUID(),
          },
          {
            name: crypto.randomUUID(),
            value: crypto.randomUUID(),
          },
          {
            name: crypto.randomUUID(),
            value: crypto.randomUUID(),
          },
        ],
      })
    },
  }
})

const sub = defineCommand({
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
              description: 'The channel permissions to get. If omitted, the guild permissions will be returned',
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
              description: 'The channel permissions to edit. If omitted, the guild permissions will be edited',
              type: ApplicationCommandOptionType.Channel,
              required: false,
            },
          ],
        },
      ],
    },
  ],
}).createHandler(() => {
  return {
    command(c) {
      // c.get('user')

      return c.reply({content: 'ok'})
    },
  }
})

const sub2 = defineCommand({
  type: ApplicationCommandType.ChatInput,
  name: 'sub2',
  description: 'sub2',
  options: [
    {
      type: ApplicationCommandOptionType.Subcommand,
      name: 's1',
      description: 'sub 1',
      options: [
        {
          type: ApplicationCommandOptionType.String,
          name: 'str',
          description: 'str',
        },
        {
          type: ApplicationCommandOptionType.String,
          name: 'name',
          description: 'Name',
          min_length: 1,
          max_length: 20,
        },
        {
          type: ApplicationCommandOptionType.Integer,
          name: 'int',
          description: 'Int',
          min_value: 1,
          max_value: 10,
        },
      ],
    },
    {
      type: ApplicationCommandOptionType.Subcommand,
      name: 's2',
      description: 'sub 2',
      options: [
        {
          type: ApplicationCommandOptionType.String,
          name: 'str',
          description: 'str',
        },
        {
          type: ApplicationCommandOptionType.String,
          name: 'str2',
          description: 'str2',
        },
      ],
    },
  ],
}).createHandler(() => {
  return {
    command(c) {
      return c.reply({content: 'ok'})
    },
  }
})

const test3 = defineCommand({
  type: ApplicationCommandType.ChatInput,
  name: 'test',
  description: '',
  options: [
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
      required: true,
    },
  ],
}).createHandler(() => {
  return {
    command(c) {
      c.get('str')

      return c.reply({content: 'tr'})
    },
  }
})

// type A = Scheme<typeof test3>

export const commands = [help, test, sub, sub2]
