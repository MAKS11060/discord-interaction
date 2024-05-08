#!/usr/bin/env -S deno run -A --unstable-hmr

import {ApplicationCommandOptionType, ApplicationCommandType} from 'discord-api-types/v10'
import {defineCommand} from '../src/builder2.ts'

// {main: (c) => {}}
const command = defineCommand({
  name: 'main',
  description: 'a',
}).createHandler({
  main: (c) => {
    return c.reply({content: 'main'})
  },
})

// {test3: {sub: (c: Context<options<ss>>) => {}}}
const commandWithSubcommand = defineCommand({
  type: ApplicationCommandType.ChatInput,
  name: 'test3',
  description: 'a',
  options: [
    {
      type: ApplicationCommandOptionType.Subcommand,
      name: 'sub',
      description: 's',
      options: [
        {
          type: ApplicationCommandOptionType.String,
          name: 'ss',
          description: 'd',
        },
      ],
    },
  ],
})
.createHandler({
  test3: {
    sub: (c) => c.reply({content: 'main'}),
  },
})

export const commands = [command, commandWithSubcommand]
