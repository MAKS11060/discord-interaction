#!/usr/bin/env -S deno run -A

/**
 * @module
 *
 * Deno-based interactive CLI for deploying commands to Discord.
 *
 * @example Install cli
 * ```bash
 * deno install -Arfgn deploy-discord --unstable-kv jsr:@maks11060/discord-interactions/cli
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

import {Checkbox} from 'jsr:@cliffy/prompt@1.0.0-rc.5/checkbox'
import {prompt} from 'jsr:@cliffy/prompt@1.0.0-rc.5/prompt'
import {Select} from 'jsr:@cliffy/prompt@1.0.0-rc.5/select'
import {parseArgs} from 'jsr:@std/cli@1/parse-args'
import {resolve} from 'jsr:@std/path@1/resolve'
import {toFileUrl} from 'jsr:@std/path@1/to-file-url'
import type {
  RESTError,
  RESTOAuth2ImplicitAuthorizationURLFragmentResult,
} from 'npm:discord-api-types@0/v10'
import type {Command} from '../src/types.ts'
import {
  cfgFilename,
  clientId,
  deleteApplicationsCommands,
  getApplicationsCommands,
  getMe,
  getToken,
  postApplicationsCommands,
  printCommandsCount,
  printOptions,
} from './_utils.ts'

if (!import.meta.main) {
  throw new Error('This is not a module. Run directly on Deno')
}

const args = parseArgs(Deno.args, {
  string: ['i', 'guild', 'kv-path'],
  boolean: ['h', 'help', 'verbose', 'spawn-subproc-with-deno-config'],
  alias: {
    h: 'help',
    i: 'guild',
    v: 'verbose',
    k: 'kv-path',
  },
})

if (args.verbose) console.log({args})
if (args.verbose) console.log('config:', await cfgFilename())

if (args.help || !args._.length) {
  console.log('%cdeploy-discord Help\n', 'color: green')
  console.log(
    '%cUsage: %cdeploy-discord %c./commands.ts\n',
    'color: blue',
    'color: green',
    'color: inherit; text-decoration: underline'
  )
  console.log('%cOptions:', 'color: blue')
  printOptions([
    {arg: '-i, --guild', description: 'Guild id for deploy commands'},
    {arg: '-h, --help', description: 'Print help'},
    {arg: '-v, --verbose', description: 'Show more logs'},
    {arg: '-k, --kv-path', description: 'Set deno kv store path'},
  ])
  Deno.exit(0)
}

// create subprocess with local deno.json[c] configs
if (!args['spawn-subproc-with-deno-config']) {
  // console.log(Deno.args)
  const command = new Deno.Command(Deno.execPath(), {
    args: [
      //
      'run',
      '-A',
      '-c',
      await cfgFilename(),
      // 'jsr:@maks11060/discord-interactions/cli',
      'C:/Users/MAKS11060/code/discord-interaction/cli/cli.ts',
      // 'https://raw.githubusercontent.com/MAKS11060/discord-interactions/main/cli/cli.ts',
      '--spawn-subproc-with-deno-config',
      '--',
      // './src/commands.ts',
      ...Deno.args, // pass args
    ],
    stdin: 'inherit',
    stdout: 'inherit',
  })
  const c = command.spawn()
  if (args.verbose) console.log('spawn deno subprocess')
  const {success, code} = await c.output()
  if (args.verbose) console.log(success ? 'graceful close' : `exit code ${code}`)
  Deno.exit(code)
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

const kv = await Deno.openKv(args['kv-path'])
if (args.verbose) {
  console.log('KV STORE')
  for await (const data of kv.list({prefix: []})) {
    console.log(data.key.join(' '), data.value)
  }
  console.log('KV STORE END')
}

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
if (args.verbose) {
  console.log('authorize', me)
} else {
  console.log(`authorize: %c${clientId} %c${me.application.name}`, 'color: green;', 'color: blue')
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

export default {}
