import {ApplicationCommandOptionType, ApplicationCommandType} from 'discord-api-types/v10'
import {defineCommand} from '../src/builder.ts'

const test1 = defineCommand({
  name: 'test1',
  description: 'test1',
}).createHandler({
  test1: () => {
    return {
      command: (c) => {
        return c.reply({content: ''})
      },
    }
  },
})

const test2 = defineCommand({
  name: 'test2',
  description: 'test2',
  options: [
    {type: ApplicationCommandOptionType.Subcommand, name: 'sub1', description: 'sub1'},
    {type: ApplicationCommandOptionType.Subcommand, name: 'sub2', description: 'sub2'},
  ],
}).createHandler({
  test2: {
    sub1: () => {
      return {
        command: (c) => {
          return c.reply({content: 'test2 sub1'})
        },
      }
    },
    sub2: () => {
      return {
        command: (c) => {
          return c.reply({content: 'test2 sub2'})
        },
      }
    },
  },
})

const test3 = defineCommand({
  name: 'test3',
  description: 'test3',
  options: [
    {
      type: ApplicationCommandOptionType.SubcommandGroup,
      name: 'sub-g1',
      description: 'sub g-1',
      options: [
        {type: ApplicationCommandOptionType.Subcommand, name: 'sub1', description: 'sub1'},
        {type: ApplicationCommandOptionType.Subcommand, name: 'sub2', description: 'sub2'},
      ],
    },
    {type: ApplicationCommandOptionType.Subcommand, name: 'sub1', description: 'sub1'},
    {type: ApplicationCommandOptionType.Subcommand, name: 'sub2', description: 'sub2'},
  ],
}).createHandler({
  test3: {
    'sub-g1': {
      sub1: (c) => ({
        command: (c) => c.reply({content: 'test3 sub-g1 sub1'}),
      }),
      sub2: (c) => ({
        command: (c) => c.reply({content: 'test3 sub-g1 sub2'}),
      }),
    },
    sub1: (c) => ({
      command: (c) => c.reply({content: 'test3 sub1'}),
    }),
    sub2: () => ({
      command: (c) => c.reply({content: 'test3 sub2'}),
    }),
  },
})

/* const test4 = defineCommand({
  type: ApplicationCommandType.User,
  name: 'test4',
}).createHandler({
  test4: (c) => c.reply({content: '1'}),
})

const test5 = defineCommand({
  type: ApplicationCommandType.Message,
  name: 'test5',
}).createHandler({
  test5: (c) => c.reply({content: '2'}),
}) */

defineCommand({
  name: 'autocomplete',
  description: 'autocomplete',
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: 'str',
      description: 'str',
      // autocomplete: true // dynamic autocomplete handler
    },
    {
      type: ApplicationCommandOptionType.String,
      name: 'str2',
      description: 'str2',
      autocomplete: true, // dynamic autocomplete handler
    },
  ],
}).createHandler({
  autocomplete: () => ({
    command: (c) => {
      return c.reply({content: '1'})
    },
    autocomplete: (c) => {
      return c.autocomplete({choices: []})
    },
  }),
})

const all = defineCommand({
  name: 'all',
  description: 'All',
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: 'str',
      description: 'Str',
    },
    {
      type: ApplicationCommandOptionType.Integer,
      name: 'int',
      description: 'Int',
    },
    {
      type: ApplicationCommandOptionType.Boolean,
      name: 'bool',
      description: 'Bool',
    },
    {
      type: ApplicationCommandOptionType.User,
      name: 'user',
      description: 'User',
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
      name: 'number',
      description: 'Number',
    },
    {
      type: ApplicationCommandOptionType.Attachment,
      name: 'attachment',
      description: 'Attachment',
    },
  ],
}).createHandler({
  // all: (command) => ({
  //   command: (c) => {
  //     console.log(c.getNumber('number').value)

  //     return c.reply({content: `ok <t:${Math.floor(Date.now() / 1000)}:R>`})
  //   },
  // }),

})

const all2 = defineCommand({
  name: 'all2',
  description: 'All2',
  options: [
    {
      type: ApplicationCommandOptionType.Subcommand,
      name: 'sub',
      description: 'Sub',
      options: [
        {
          type: ApplicationCommandOptionType.String,
          name: 'str',
          description: 'Str',
        },
        {
          type: ApplicationCommandOptionType.Integer,
          name: 'int',
          description: 'Int',
        },
        {
          type: ApplicationCommandOptionType.Boolean,
          name: 'bool',
          description: 'Bool',
        },
        {
          type: ApplicationCommandOptionType.User,
          name: 'user',
          description: 'User',
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
          name: 'number',
          description: 'Number',
        },
        {
          type: ApplicationCommandOptionType.Attachment,
          name: 'attachment',
          description: 'Attachment',
        },
      ],
    },
  ],
}).createHandler({
  all: (command) => ({
    command: (c) => {
      console.log(c.getNumber('number').value)

      return c.reply({content: `ok <t:${Math.floor(Date.now() / 1000)}:R>`})
    },
  }),
})

export const commands = [test1, test2, test3, /* test4, test5, */ all, all2]
