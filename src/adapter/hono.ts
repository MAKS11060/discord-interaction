/**
 * @module
 * Adapter for {@link https://hono.dev Hono} framework
 *
 * @example Usage `Hono` framework
 * ```ts
 * // main.ts
 * import {Hono} from 'hono'
 * import {discordInteraction, importKeyRaw} from '@maks11060/discord-interactions/hono'
 * import {commands} from './src/commands.ts'
 *
 * const app = new Hono()
 * const key = await importKeyRaw(Deno.env.get('CLIENT_PUBLIC_KEY')!)
 *
 * app.post('/interaction', ...await discordInteraction(key, commands))
 *
 * Deno.serve(app.fetch)
 * ```
 */

import type {APIInteraction} from 'discord-api-types/v10'
import type {Handler} from 'hono'
import {createFactory} from 'hono/factory'
import {createHandler, type CreateHandlerOptions} from '../interaction.ts'
import {verifyRequestSignature as verifyRequest} from '../lib/ed25519.ts'
import type {Command} from '../types.ts'

export {importKeyRaw} from '../lib/ed25519.ts'

/**
 * Creates a middleware function that verifies the signature of a request using a CryptoKey object.
 *
 * @param {CryptoKey} key - The CryptoKey object representing the public key to use for verification.
 * @returns {MiddlewareHandler} A middleware function that can be used with the Hono framework to verify the signature of a request.
 */
const verifyRequestSignature = (key: CryptoKey) => {
  return createFactory().createMiddleware(async (c, next) => {
    const invalid = await verifyRequest(c.req.raw, key)
    if (invalid) return invalid
    await next()
  })
}

/**
 * Adapter for {@link https://hono.dev Hono} framework.
 *
 * Creates a set of middleware handlers for the Hono framework that can be used to handle Discord interactions.
 *
 * @param {CryptoKey} key - The CryptoKey object representing the public key to use for verifying the signature of the interaction.
 * @param {Command[]} commands - An array of Command objects representing the commands that the bot supports.
 * @returns {Promise<Handler[]>} A promise that resolves to an array of middleware handlers that can be used with the Hono framework to handle Discord interactions.
 *
 * @example
 * ```ts
 * import {Hono} from 'hono'
 * import {discordInteraction} from '@maks11060/discord-interactions/hono'
 *
 * const app = new Hono()
 * const key = await importKeyRaw(Deno.env.get('CLIENT_PUBLIC_KEY')!)
 *
 * app.post('/interaction', ...await discordInteraction(key, []))
 * ```
 */
export const discordInteraction = async (
  key: CryptoKey,
  commands: Command[],
  options?: CreateHandlerOptions
): Promise<Handler[]> => {
  const handler = await createHandler(commands, options)

  const interactionHandler = createFactory().createMiddleware(async (c) => {
    const interaction = await c.req.json<APIInteraction>()
    return c.json(await handler(interaction))
  })

  return createFactory().createHandlers(verifyRequestSignature(key), interactionHandler)
}
