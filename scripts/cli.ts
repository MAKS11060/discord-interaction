#!/usr/bin/env -S deno run -A --watch

import {RESTOAuth2ImplicitAuthorizationURLFragmentResult} from 'discord-api-types/v10'
import {Checkbox, Select, prompt} from 'https://deno.land/x/cliffy/prompt/mod.ts'
import {commands} from '../src/commands.ts'
import {
  clientId,
  deleteApplicationsCommands,
  getApplicationsCommands,
  getToken,
  postApplicationsCommands,
} from './_utils.ts'

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

while (true) {
  const select = await prompt([
    {
      type: Select,
      name: 'action',
      message: 'Select action',
      options: [
        {value: 'get', name: 'Get commands'},
        {value: 'list', name: 'List commands with details'},
        {value: 'deploy', name: 'Deploy commands'},
        {value: 'delete', name: 'Delete commands'},
        {value: 'exit', name: 'Close CLI'},
      ],
    },
  ])

  if (select.action === 'exit') break

  if (select.action === 'get') {
    const commands = await getApplicationsCommands(token)
    for (const command of commands) {
      console.log(command.id, command.name)
    }
  }

  if (select.action === 'list') {
    const commands = await getApplicationsCommands(token)
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
        options: commands.map(({command}) => ({value: command, name: command.name})),
      },
    ])

    for (const item of (deploy as any[]) || []) {
      const {errors, ...deploy} = await postApplicationsCommands(token, item)
      if (!errors) console.log(`Deploy: %c${deploy.id} ${item.name}`, 'color: green;')
      else console.error(`Deploy: ${item.name}`, JSON.stringify(errors, null, 2))
    }
  }

  if (select.action === 'delete') {
    const commands = await getApplicationsCommands(token)
    const select = await prompt([
      {
        type: Checkbox,
        message: 'Select to remove',
        name: 'name',
        options: commands.map((it) => ({value: it.id, name: it.name})),
      },
    ])

    for (const item of select?.name || []) {
      console.log(`Delete: ${item}`, await deleteApplicationsCommands(token, item))
    }
  }
}
