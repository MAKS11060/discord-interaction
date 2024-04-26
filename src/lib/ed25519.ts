import {concat} from '@std/bytes'
import {decodeHex, encodeHex} from '@std/encoding/hex'
import {createMiddleware} from 'hono/factory'
const encoder = new TextEncoder()

export const importRawKey = (publicKey: string): Promise<CryptoKey> => {
  return crypto.subtle.importKey(
    'raw',
    decodeHex(publicKey),
    'Ed25519',
    false,
    ['verify']
  )
}

/**
 * Verify {@linkcode Request} signature using {@linkcode CryptoKey}(publicKey).
 * - header `X-Signature-Ed25519`
 * - header `X-Signature-Timestamp`
 * - payload (`X-Signature-Timestamp` + `body`)
 */
export const verifyRequestSignature = (key: CryptoKey) => {
  return createMiddleware(async (c, next) => {
    const signature = c.req.raw.headers.get('X-Signature-Ed25519')
    const timestamp = c.req.raw.headers.get('X-Signature-Timestamp')
    const body = new Uint8Array(await c.req.raw.clone().arrayBuffer())

    if (signature === null || timestamp === null) {
      return c.json({error: 'Bad request signature'}, 401)
    }

    const valid = await crypto.subtle.verify(
      key.algorithm,
      key,
      decodeHex(signature),
      concat([encoder.encode(timestamp), body]) // (timestamp + body)
    )
    if (!valid) return c.json({error: 'Bad request signature'}, 401)

    await next()
  })
}

export const signRequest = async (
  req: Request,
  key: CryptoKey
): Promise<Request> => {
  const body = new Uint8Array(await req.clone().arrayBuffer())
  const timestamp = Math.floor(Date.now() / 1000).toString()
  const signature = await crypto.subtle.sign(
    'Ed25519',
    key,
    concat([encoder.encode(timestamp), body]) // (timestamp + body)
  )
  const newReq = new Request(req)
  newReq.headers.set('X-Signature-Ed25519', encodeHex(signature))
  newReq.headers.set('X-Signature-Timestamp', timestamp)
  return newReq
}
