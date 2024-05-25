import {ApplicationCommandOptionType, ApplicationCommandType} from 'discord-api-types/v10'
import {defineCommand} from '../src/builder.ts'

const test1 = defineCommand({
  name: 'test1',
  description: 'test1',
}).createHandler({
  test1: (c) => {
    return c.reply({content: 'ok'})
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
    sub1: (c) => {
      return c.reply({content: 'test2 sub1'})
    },
    sub2: (c) => {
      return c.reply({content: 'test2 sub2'})
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
      sub1: (c) => {
        return c.reply({content: 'test3 sub-g1 sub1'})
      },
      sub2: (c) => {
        return c.reply({content: 'test3 sub-g1 sub2'})
      },
    },
    sub1: (c) => {
      return c.reply({content: 'test3 sub1'})
    },
    sub2: (c) => {
      return c.reply({content: 'test3 sub2'})
    },
  },
})

const test4 = defineCommand({
  type: ApplicationCommandType.User,
  name: 'test4',
}).createHandler({
  test4: (c) => {
    return c.reply({content: '1'})
  },
})

const test5 = defineCommand({
  type: ApplicationCommandType.Message,
  name: 'test5',
}).createHandler({
  test5: (c) => {
    return c.reply({content: '2'})
  },
})

export const commands = [test1, test2, test3, test4, test5]
