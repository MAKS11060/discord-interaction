/**
 * @module
 * Adapter for {@link https://hono.dev Hono} framework
 *
 * @example Usage hono framework
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

import type {APIInteraction} from 'discord-api-types/v10'
import type {Handler} from 'hono'
import {createFactory, createMiddleware} from 'hono/factory'
import {createHandler} from '../interaction.ts'
import {verifyRequestSignature as verifyRequest} from '../lib/ed25519.ts'
import type {Command} from '../types.ts'

export {importKeyRaw} from '../lib/ed25519.ts'

/**
 * Verify {@linkcode Request} signature using {@linkcode CryptoKey}(publicKey).
 * - header `X-Signature-Ed25519`
 * - header `X-Signature-Timestamp`
 * - payload (`X-Signature-Timestamp` + `body`)
 */
const verifyRequestSignature = (key: CryptoKey) => {
  return createMiddleware(async (c, next) => {
    const invalid = await verifyRequest(c.req.raw, key)
    if (invalid) return invalid
    await next()
  })
}

/**
 * Adapter for {@link https://hono.dev Hono} framework
 *
 * @example
 * ```ts
 * import {Hono} from 'hono'
 * import {discordInteraction} from '@maks11060/discord-interaction/hono'
 *
 * const app = new Hono()
 * const key = await importKeyRaw(Deno.env.get('CLIENT_PUBLIC_KEY')!)
 *
 * app.post('/interaction', ...await discordInteraction(key, []))
 * ```
 */
export const discordInteraction = async (
  key: CryptoKey,
  commands: Command[]
): Promise<Handler[]> => {
  const handler = await createHandler(commands)

  const interactionHandler = createMiddleware(async (c) => {
    const interaction = await c.req.json<APIInteraction>()
    return c.json(await handler(interaction))
  })

  return createFactory().createHandlers(verifyRequestSignature(key), interactionHandler)
}
