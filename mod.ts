/**
 * @module
 *
 * Discord interaction
 *
 * @example Use `Hono` framework
 * ```ts
 * import {Hono} from 'hono'
 * import {discordInteraction, importKeyRaw} from '@maks11060/discord-interaction/hono'
 *
 * const app = new Hono()
 * const key = await importKeyRaw(Deno.env.get('CLIENT_PUBLIC_KEY')!)
 *
 * app.post('/interaction', ...await discordInteraction(key, []))
 *
 * Deno.serve(app.fetch)
 * ```
 */

export {importKeyRaw} from './src/lib/ed25519.ts'
export {discordInteraction, defineCommand} from './src/interaction.ts'
