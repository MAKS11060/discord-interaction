#!/usr/bin/env -S deno run -A

/**
 * @module
 *
 * Deno-based interactive CLI for deploying commands to Discord.
 *
 * @example Install cli
 * ```bash
 * deno install -Arfg -n deploy-discord --unstable-kv jsr:@maks11060/discord-interactions/cli
 * ```
 *
 * @example Run directly
 * ```bash
 * deno run -A --unstable-kv jsr:@maks11060/discord-interactions/cli
 * ```
 *
 * @example Usage
 * ```bash
 * deploy-discord -h
 * ```
 */

import {parseArgs} from '@std/cli/parse-args'
import {resolve} from '@std/path/resolve'
import {toFileUrl} from '@std/path/to-file-url'
import type {
  RESTError,
  RESTGetAPIApplicationCommandsResult,
  RESTOAuth2ImplicitAuthorizationURLFragmentResult,
} from 'discord-api-types/v10'
import {Checkbox, Select, prompt} from '@cliffy/prompt'
import type {Command} from '../src/types.ts'
import {
  clientId,
  deleteApplicationsCommands,
  getApplicationsCommands,
  getMe,
  getToken,
  postApplicationsCommands,
} from './_utils.ts'

if (!import.meta.main) {
  throw new Error('This is not a module. Run directly on Deno')
}

const args = parseArgs(Deno.args, {
  string: ['i', 'guild'],
  boolean: ['h', 'help', 'verbose'],
  alias: {
    h: 'help',
    i: 'guild',
    v: 'verbose',
  },
})
// console.log(args)

const printOptions = (options: {arg: string; description: string}[], offset = 4) => {
  let padding = 0
  for (const option of options) padding = Math.max(padding, option.arg.length)
  for (const option of options) {
    console.log(
      `${''.padEnd(offset, ' ')}%c${option.arg.padEnd(padding + 1, ' ')} %c${option.description}`,
      'color: blue',
      'color: inherit'
    )
  }
}

const help = `%cdeploydiscord Help

%cUsage: %cdeploydiscord %c./commands.ts

%cOptions:`

if (args.help || !args._.length) {
  console.log(
    help,
    'color: green',
    'color: blue',
    'color: green',
    'color: inherit; text-decoration: underline',
    'color: blue'
  )
  printOptions([
    {arg: '-i, --guild', description: 'Guild id for deploy commands'},
    {arg: '-h, --help', description: 'Print help'},
    {arg: '-v, --verbose', description: 'Show more logs'},
  ])
  Deno.exit(0)
}

const commandsPath = resolve(Deno.cwd(), args._[0].toString()).toString()
console.log(`load: %c${commandsPath}`, 'color: green;')

const commands: Command[] = await import(toFileUrl(commandsPath).toString())
  .then((r) => {
    return [...(r?.default ?? []), ...(r?.commands ?? [])]
  })
  .catch((e) => {
    console.error('invalid commands in file')
    Deno.exit(1)
  })

if (args.verbose) console.log('commands:', commands)

const kv = await Deno.openKv()

const authorize = async () => {
  if (!(await kv.get(['token', clientId])).versionstamp) {
    const token = await getToken() // authorize
    // console.log(`authorize: %c${clientId}`, 'color: blue;')
    await kv.set(['token', clientId], token, {
      expireIn: token.expires_in * 1000,
    })
    return token
  }

  const res = await kv.get<RESTOAuth2ImplicitAuthorizationURLFragmentResult>(['token', clientId])
  return res.value
}

const token = await authorize()
if (!token) {
  await kv.delete(['token', clientId])
  throw new Error('Not authorized. restart CLI')
}

const me = await getMe(token)
if (args.verbose) console.log('authorize', me)
else
  console.log(`authorize: %c${clientId} %c${me.application.name}`, 'color: green;', 'color: blue')

const printCommandsCount = (commands: RESTGetAPIApplicationCommandsResult) => {
  console.log(
    `%cCommands %c${commands.filter((v) => v.type === 1).length}/100%c | User %c${
      commands.filter((v) => v.type === 2).length
    }/5%c | Message %c${commands.filter((v) => v.type === 3).length}/5`,
    'color: blue',
    'color: green',
    'color: blue',
    'color: green',
    'color: blue',
    'color: green'
  )
}

while (import.meta.main) {
  const select = await prompt([
    {
      type: Select,
      name: 'action',
      message: 'Select action',
      options: [
        {value: 'get', name: 'Get commands'},
        {value: 'list', name: 'Get commands JSON'},
        {value: 'deploy', name: 'Deploy commands'},
        // ...(args?.guild ? [{value: 'deploy-guild', name: `Deploy commands guild(${args.guild})`}] : []),
        {value: 'delete', name: 'Delete commands'},
        {value: 'exit', name: 'Close CLI'},
      ],
    },
  ])

  if (select.action === 'exit') break

  if (select.action === 'get') {
    const commands = await getApplicationsCommands(token, args?.guild)
    printCommandsCount(commands)
    for (const command of commands) {
      console.log(command.id, command.name)
    }
  }

  if (select.action === 'list') {
    const commands = await getApplicationsCommands(token, args?.guild)
    printCommandsCount(commands)
    for (const command of commands) {
      console.log(command.id, command.name, command)
    }
  }

  if (select.action === 'deploy') {
    const {deploy} = await prompt([
      {
        type: Checkbox,
        message: 'Select to deploy',
        name: 'deploy',
        options: commands.map(({command}) => ({
          value: command,
          name: command.name,
        })),
      },
    ])

    for (const item of (deploy as any[]) || []) {
      const deploy = await postApplicationsCommands(token, item, args?.guild)

      if ((deploy as unknown as RESTError).errors)
        console.error(`Deploy: ${item.name}`, JSON.stringify(deploy, null, 2))

      console.log(`Deploy: %c${deploy.id} ${item.name}`, 'color: green')
    }
  }

  if (select.action === 'delete') {
    const commands = await getApplicationsCommands(token, args?.guild)
    const select = await prompt([
      {
        type: Checkbox,
        message: 'Select to remove',
        name: 'name',
        options: commands.map((it) => ({value: it.id, name: it.name})),
      },
    ])

    for (const item of select?.name || []) {
      console.log(`Delete: ${item}`, await deleteApplicationsCommands(token, item, args?.guild))
    }
  }
}
