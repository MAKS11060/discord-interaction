/**
 * @module
 *
 * Discord interaction
 *
 *
 * @example Use `Hono`
 * ```ts
 * import {Hono} from 'hono'
 * import {discordInteraction, importKeyRaw} from '@maks11060/discord-interaction/hono'
 *
 * const app = new Hono()
 * const key = await importKeyRaw(Deno.env.get('CLIENT_PUBLIC_KEY')!)
 *
 * app.post('/interaction', ...discordInteraction(key, []))
 *
 * Deno.serve(app.fetch)
 * ```
 */

export {importKeyRaw, verifyRequestSignature} from './src/lib/ed25519.ts'
export {discordInteraction} from './src/interaction.ts'
export {defineCommand} from './src/builder0.ts'
