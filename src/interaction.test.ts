#!/usr/bin/env -S deno test -A --watch

import {APIInteraction, ApplicationCommandOptionType, ApplicationCommandType} from 'discord-api-types/v10'
import {associateBy} from '@std/collections'
import {Command} from './types.ts'
import {commandsInit, defineCommand} from './interaction.ts'

const interactionRaw = {
  data: {
    guild_id: '1213048588805083157',
    id: '1248791663539785808',
    name: 'all2',
    options: [
      {
        name: 'sub',
        options: [
          {
            name: 'user',
            type: 6,
            value: '329655633668341760',
          },
        ],
        type: 1,
      },
    ],
    resolved: {
      members: {
        '329655633668341760': {
          avatar: null,
          communication_disabled_until: null,
          flags: 0,
          joined_at: '2024-03-01T09:02:00.933000+00:00',
          nick: null,
          pending: false,
          permissions: '2251799813685247',
          premium_since: null,
          roles: ['1223907646852300863'],
          unusual_dm_activity_until: null,
        },
      },
      users: {
        '329655633668341760': {
          avatar: '257f593899038fe7e0fcc12902b5853d',
          avatar_decoration_data: null,
          clan: null,
          discriminator: '0',
          global_name: 'MAKS11060',
          id: '329655633668341760',
          public_flags: 4194368,
          username: 'maks11060',
        },
      },
    },
    type: 1,
  },
  type: 2,
} as any as APIInteraction

const test1 = defineCommand({
  name: 'test',
  description: 'test',
}).createHandler({
  test: (schema) => {
    console.log({schema})
    return {
      command: (c) => {
        return c.reply({content: ''})
      },
    }
  },
})

const test2 = defineCommand({
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
  all2: {
    sub: (schema) => {
      console.log({schema})

      return {
        command: (c) => {
          console.log(c.getNumber('number').value)
          return c.reply({content: `ok <t:${Math.floor(Date.now() / 1000)}:R>`})
        },
      }
    },
  },
})

const a = defineCommand({
  type: ApplicationCommandType.Message,
  name: 'reverse',
}).createHandler({
  reverse: (schema) => {
    console.log({schema})
    return {
      command(c) {
        return c.reply({content: ''})
      },
    }
  },
})

const b = defineCommand({
  name: 'test3',
  description: '1',
  options: [
    {
      type: ApplicationCommandOptionType.SubcommandGroup,
      name: 'subgroup',
      description: 'subgroup',
      options: [
        {
          type: ApplicationCommandOptionType.Subcommand,
          name: 'sub1',
          description: 'sub1',
          options: [
            {
              type: ApplicationCommandOptionType.String,
              name: 's',
              description: 's',
            },
            {
              type: ApplicationCommandOptionType.String,
              name: 'ssa',
              description: 'a',
            },
          ],
        },
      ],
    },
  ],
}).createHandler({
  test3: {
    subgroup: {
      sub1: (schema) => {
        console.log({schema})

        return {
          command(c) {
            c
            return c.reply({content: ''})
          },
        }
      },
    },
  },
})

commandsInit([
  test1,
  test2,
  a,
  // b,
])

