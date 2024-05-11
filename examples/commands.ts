#!/usr/bin/env -S deno run -A --unstable-hmr

import {ApplicationCommandOptionType} from 'discord-api-types/v10'
import {defineCommand} from '../src/builder2.ts'

// {main: (c) => {}}
defineCommand({
  name: 'main',
  description: 'a',
}).createHandler({
  main: (c) => {
    c.command.name === 'main'
    return c.reply({content: 'main'})
  },
})

defineCommand({
  name: 'test2',
  description: 'a',
  options: [
    {type: ApplicationCommandOptionType.String, name: 'str', description: '1'},
    {type: ApplicationCommandOptionType.Integer, name: 'int', description: '2'},
  ],
}).createHandler({
  test2: (c) => {
    c.command.name === 'test2'
    c.getOption('s')

    c.getOption('str').type === ApplicationCommandOptionType.String
    c.getOption('str').name === 'str'
    c.getOption('str').value

    return c.reply({content: 'main'})
  },
})

// {test3: {sub: (c: Context<options<ss>>) => {}}}
defineCommand({
  name: 'test3',
  description: 'a',
  options: [
    {
      type: ApplicationCommandOptionType.Subcommand,
      name: 'sub',
      description: 'b',
      options: [
        {type: ApplicationCommandOptionType.String, name: 'str', description: '1'},
        {type: ApplicationCommandOptionType.Integer, name: 'int', description: '2'},
      ],
    },
  ],
}).createHandler({
  test3: {
    sub: (c) => {
      c.getOption('str').name === 'str'
      return c.reply({content: 'main'})
    },
  },
})

export const commands = []
