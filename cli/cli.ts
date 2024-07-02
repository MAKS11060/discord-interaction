#!/usr/bin/env -S deno run -A

import {parseArgs} from '@std/cli'
import {resolve, toFileUrl} from '@std/path'
import type {RESTOAuth2ImplicitAuthorizationURLFragmentResult} from 'discord-api-types/v10'
import {Checkbox, Select, prompt} from 'https://deno.land/x/cliffy/prompt/mod.ts'
import {
  clientId,
  deleteApplicationsCommands,
  getApplicationsCommands,
  getToken,
  postApplicationsCommands,
} from './_utils.ts'

if (!import.meta.main) {
  throw new Error('This is not a module. Run directly')
}

const args = parseArgs(Deno.args, {
  string: ['i', 'guild'],
  boolean: ['h', 'help'],
  alias: {
    h: 'help',
    i: 'guild',
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
  ])
  Deno.exit(0)
}

const commandsPath = resolve(Deno.cwd(), args._[0].toString()).toString()
console.log(`load: ${commandsPath}`)

const commands = await import(toFileUrl(commandsPath).toString())
  .then((r) => {
    return r.commands
  })
  .catch((e) => {
    console.error('invalid commands file')
    Deno.exit(1)
  })

const kv = await Deno.openKv()

const authorize = async () => {
  if (!(await kv.get(['token', clientId])).versionstamp) {
    const token = await getToken() // authorize
    console.log('authorize', clientId)
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
  throw new Error('not authorized. restart cli')
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
    console.log(`%cCommands ${commands.length}/100`, 'color: blue')
    for (const command of commands) {
      console.log(command.id, command.name)
    }
  }

  if (select.action === 'list') {
    const commands = await getApplicationsCommands(token, args?.guild)
    console.log(`%cCommands ${commands.length}/100`, 'color: blue')
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
      const {errors, ...deploy} = await postApplicationsCommands(token, item, args?.guild)
      if (!errors) console.log(`Deploy: %c${deploy.id} ${item.name}`, 'color: green')
      else console.error(`Deploy: ${item.name}`, JSON.stringify(errors, null, 2))
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
