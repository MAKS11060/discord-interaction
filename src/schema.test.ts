#!/usr/bin/env -S deno test -A --watch

/*
VALID
command
  subcommand
  subcommand

command
  subcommand-group
    subcommand
  subcommand-group
    subcommand

command
  subcommand-group
    subcommand
  subcommand

INVALID
command
  subcommand-group
    subcommand-group
  subcommand-group
    subcommand-group

command
  subcommand
    subcommand-group
  subcommand
    subcommand-group
*/

import {
  ApplicationCommandOptionType,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord-api-types/v10'
import {commandSchema} from './schema.ts'

Deno.test('case 1', () => {
  commandSchema.parse({
    name: 'test',
    description: 'test',
    options: [
      {
        type: ApplicationCommandOptionType.Subcommand,
        name: 'sub1',
        description: 'test',
      },
      {
        type: ApplicationCommandOptionType.Subcommand,
        name: 'sub2',
        description: 'test',
      },
    ],
  } satisfies RESTPostAPIChatInputApplicationCommandsJSONBody)
})

Deno.test('case 2', () => {
  commandSchema.parse({
    name: 'test',
    description: 'test',
    options: [
      {
        type: ApplicationCommandOptionType.SubcommandGroup,
        name: 'sub1',
        description: 'test',
        options: [
          {
            type: ApplicationCommandOptionType.Subcommand,
            name: 'sub1',
            description: 'test',
          },
          {
            type: ApplicationCommandOptionType.Subcommand,
            name: 'sub2',
            description: 'test',
          },
        ],
      },
      {
        type: ApplicationCommandOptionType.SubcommandGroup,
        name: 'sub1',
        description: 'test',
        options: [
          {
            type: ApplicationCommandOptionType.Subcommand,
            name: 'sub1',
            description: 'test',
          },
          {
            type: ApplicationCommandOptionType.Subcommand,
            name: 'sub2',
            description: 'test',
          },
        ],
      },
    ],
  } satisfies RESTPostAPIChatInputApplicationCommandsJSONBody)
})

Deno.test('case 3', () => {
  commandSchema.parse({
    name: 'test',
    description: 'test',
    options: [
      {
        type: ApplicationCommandOptionType.SubcommandGroup,
        name: 'sub1',
        description: 'test',
        options: [
          {
            type: ApplicationCommandOptionType.Subcommand,
            name: 'sub1',
            description: 'test',
          },
          {
            type: ApplicationCommandOptionType.Subcommand,
            name: 'sub2',
            description: 'test',
          },
        ],
      },
      {
        type: ApplicationCommandOptionType.Subcommand,
        name: 'sub2',
        description: 'test',
      },
    ],
  } satisfies RESTPostAPIChatInputApplicationCommandsJSONBody)
})

Deno.test('case 4', () => {
  /* typescript guaranteed this case */
})

Deno.test('case 5', () => {
  /* typescript guaranteed this case */
})
