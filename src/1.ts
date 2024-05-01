#!/usr/bin/env -S deno run -A --unstable-hmr

import {associateBy} from '@std/collections/associate-by'
import {
APIApplicationCommandBasicOption,
  APIApplicationCommandOption,
  ApplicationCommandOptionType,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord-api-types/v10'
import {Pretty} from './types.ts'

const def = <T extends RESTPostAPIChatInputApplicationCommandsJSONBody>(command: Pretty<T>) => command
const defOptions = <T extends APIApplicationCommandOption[]>(options: Pretty<T>) => options

type OptionsToObject<Options extends APIApplicationCommandOption> = Options extends {required: true}
  ? {[K in Options as K['name']]: K}
  : {[K in Options as K['name']]?: K}

type ExtractOptions<T extends RESTPostAPIChatInputApplicationCommandsJSONBody> = T['options'] extends Array<infer O>
  ? O extends APIApplicationCommandOption
    ? O
    : never
  : never

// type ExtractOptionsObj<T extends RESTPostAPIChatInputApplicationCommandsJSONBody> = T['options'] extends APIApplicationCommandBasicOption[] ?
//   ? T['options'] extends APIApplicationCommandBasicOption
//     ? OptionsToObject<T['options']>
//     : never
//   : never



class Context<T extends RESTPostAPIChatInputApplicationCommandsJSONBody> {
  // options: ExtractOptionsObj<T> | object

  constructor(readonly command: Pretty<T>) {
    if (command.options) {
      // this.options = associateBy(command.options, it => it.name)
      // this.options = {}
    }
  }

  getOption(name: string) {
    // const option = this.options.find((option) => option.name === name)
  }
}

// type ExtractOptions<T extends APIApplicationCommandOption[]> = T extends Array<infer O>
//   ? O extends APIApplicationCommandOption
//     ? O
//     : never
//   : never


const c = new Context({
  name: 'test',
  description: 'test',
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: 'str',
      description: 'str',
      required: true,
    },
    {
      type: ApplicationCommandOptionType.Integer,
      name: 'int',
      description: 'Int',
    },
  ],
})



// =======================================
const d = def({
  name: 'test',
  description: 'test',
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: 'str',
      description: 'str',
      required: true,
    },
    {
      type: ApplicationCommandOptionType.Integer,
      name: 'int',
      description: 'Int',
    },
  ],
})

type D = typeof d


