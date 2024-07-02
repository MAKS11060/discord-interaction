#!/usr/bin/env -S deno run -A --watch --watch-exclude="deno.*"

import {parseArgs} from 'jsr:@std/cli/parse-args'
import {format, parse} from 'jsr:@std/semver'

const arg = parseArgs(Deno.args, {
  alias: {
    v: 'ver',
    c: 'config',
  },
  default: {
    config: 'deno.jsonc',
  },
  string: ['ver', 'config'],
})

if (!arg.ver) {
  throw new Error('Publish version is undefined')
}

const ver = parse(arg.ver.startsWith('v') ? arg.ver.slice(1) : arg.ver)
const cfg = Deno.readTextFileSync(arg.config).replace(
  /\"version\":\s*"\d+\.\d+\.\d+"/,
  `"version": "${format(ver)}"`
)

Deno.writeTextFileSync(arg.config, cfg)

// console.log('config', cfg)
