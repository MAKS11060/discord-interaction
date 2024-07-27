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

import {concat} from '@std/bytes/concat'
import {decodeHex} from '@std/encoding/hex'
import type {APIInteraction} from 'discord-api-types/v10'
import type {Handler} from 'hono'
import {createFactory} from 'hono/factory'
import {createHandler, type CreateHandlerOptions} from '../interaction.ts'
import type {Command} from '../types.ts'

export {importKeyRaw} from '../lib/ed25519.ts'

const encoder = new TextEncoder()

/**
 * Creates a middleware function that verifies the signature of a request using a {@linkcode CryptoKey} object.
 *
 * @param {CryptoKey} key - The {@linkcode CryptoKey} object representing the public key to use for verification.
 * @returns {MiddlewareHandler} A middleware function that can be used with the Hono framework to verify the signature of a request.
 */
const verifyRequestSignature = (key: CryptoKey) => {
  return createFactory().createMiddleware(async (c, next) => {
    const signature = c.req.header('X-Signature-Ed25519')
    const timestamp = c.req.header('X-Signature-Timestamp')
    if (!signature || !timestamp) {
      return Response.json({error: 'Bad request signature'}, {status: 401})
    }

    const valid = await crypto.subtle.verify(
      key.algorithm,
      key,
      decodeHex(signature),
      concat([encoder.encode(timestamp), new Uint8Array(await c.req.arrayBuffer())]) // (timestamp + body)
    )
    if (!valid) {
      return Response.json({error: 'Bad request signature'}, {status: 401})
    }

    await next()
  })
}

/**
 * Adapter for {@link https://hono.dev Hono} framework.
 *
 * Creates a set of middleware handlers for the `Hono` framework that can be used to handle Discord interactions.
 *
 * @param {CryptoKey} key - The CryptoKey object representing the public key to use for verifying the signature of the interaction.
 * @param {Command[]} commands - An array of Command objects representing the commands that the bot supports.
 * @returns {Promise<Handler[]>} A promise that resolves to an array of middleware handlers that can be used with the `Hono` framework to handle Discord interactions.
 *
 * @example
 * ```ts
 * import {Hono} from 'hono'
 * import {discordInteraction} from '@maks11060/discord-interactions/hono'
 * import {commands} from './src/commands.ts'
 *
 * const app = new Hono()
 * const key = await importKeyRaw(Deno.env.get('CLIENT_PUBLIC_KEY')!)
 *
 * app.post('/interaction', ...await discordInteraction(key, commands))
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
