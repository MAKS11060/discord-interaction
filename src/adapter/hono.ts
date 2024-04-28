/**
 * Adapter for  {@link https://hono.dev Hono} framework
 * @module
 */

import {APIInteraction} from 'discord-api-types/v10'
import {createFactory, createMiddleware} from 'hono/factory'
import {DefineCommand} from '../builder.ts'
import {createHandler} from '../interaction.ts'
import {verifyRequestSignature as verifyRequest} from '../lib/ed25519.ts'

/**
 * Verify {@linkcode Request} signature using {@linkcode CryptoKey}(publicKey).
 * - header `X-Signature-Ed25519`
 * - header `X-Signature-Timestamp`
 * - payload (`X-Signature-Timestamp` + `body`)
 */
export const verifyRequestSignature = (key: CryptoKey) => {
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
 * import {discordInteraction} from './hono.ts'
 *
 * const app = new Hono()
 * const key = await importKeyRaw(Deno.env.get('CLIENT_PUBLIC_KEY')!)
 *
 * app.post('/interaction', ...discordInteraction(key, commands))
 * ```
 */
export const discordInteraction = <T extends DefineCommand[]>(key: CryptoKey, commands: T) => {
  const handler = createHandler(commands)
  const interactionHandler = createMiddleware(async (c) => {
    const interaction = await c.req.json<APIInteraction>()
    return c.json(await handler(interaction))
  })

  return createFactory().createHandlers(verifyRequestSignature(key), interactionHandler)
}
