/**
 * @module
 *
 * Discord interaction
 *
 * @example Use web standards api
 * ```ts
 * import {importKeyRaw, discordInteraction} from '@maks11060/discord-interaction'
 * import {commands} from './commands.ts'
 *
 * const key = await importKeyRaw(Deno.env.get('CLIENT_PUBLIC_KEY')!)
 * const interaction = await discordInteraction(key, commands)
 *
 * Deno.serve(req => {
 *   const uri = new URL(req.url)
 *   if (req.method === 'POST' && uri.pathname === '/interaction') {
 *     return interaction(req)
 *   }
 *   return new Response('404 Not found', {status: 404})
 * })
 * ```
 *
 * @example Use `Hono` framework
 * ```ts
 * import {Hono} from 'hono'
 * import {discordInteraction, importKeyRaw} from '@maks11060/discord-interaction/hono'
 * import {commands} from './commands.ts'
 *
 * const app = new Hono()
 * const key = await importKeyRaw(Deno.env.get('CLIENT_PUBLIC_KEY')!)
 *
 * app.post('/interaction', ...await discordInteraction(key, commands))
 *
 * Deno.serve(app.fetch)
 * ```
 */

export {defineCommand, discordInteraction} from './src/interaction.ts'
export {importKeyRaw} from './src/lib/ed25519.ts'
export {DateTimeFormat, format} from './src/lib/message-format.ts'

