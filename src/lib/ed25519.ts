import {concat} from '@std/bytes/concat'
import {decodeHex, encodeHex} from '@std/encoding/hex'

const encoder = new TextEncoder()

/**
 * Imports a public key from a hexadecimal string and returns a CryptoKey object.
 *
 * @param {string} publicKey - The public key in hexadecimal format.
 * @returns {Promise<CryptoKey>} A promise that resolves to a CryptoKey object representing the imported public key.
 */
export const importKeyRaw = (publicKey: string): Promise<CryptoKey> => {
  return crypto.subtle.importKey('raw', decodeHex(publicKey), 'Ed25519', false, ['verify'])
}

/**
 * Verifies the signature of a {@linkcode request} using a {@linkcode CryptoKey} object.
 *
 * The function checks the `X-Signature-Ed25519` and `X-Signature-Timestamp` headers of the request,
 * and verifies the signature using the provided CryptoKey object. If the signature is invalid,
 * the function returns a Response object with a 401 status code and an error message.
 *
 * @param {Request} request - The request object to verify the signature of.
 * @param {CryptoKey} key - The CryptoKey object representing the public key to use for verification.
 * @returns {Promise<Response | null>} A promise that resolves to a Response object with an error message if the signature is invalid, or null if the signature is valid.
 */
export const verifyRequestSignature = async (
  request: Request,
  key: CryptoKey
): Promise<Response | null> => {
  const signature = request.headers.get('X-Signature-Ed25519')
  const timestamp = request.headers.get('X-Signature-Timestamp')
  const body = new Uint8Array(await request.clone().arrayBuffer())

  if (signature === null || timestamp === null) {
    return Response.json({error: 'Bad request signature'}, {status: 401})
  }

  const valid = await crypto.subtle.verify(
    key.algorithm,
    key,
    decodeHex(signature),
    concat([encoder.encode(timestamp), body]) // (timestamp + body)
  )
  if (!valid) {
    return Response.json({error: 'Bad request signature'}, {status: 401})
  }

  return null
}

/**
 * Signs a request using a CryptoKey object.
 *
 * The function adds the `X-Signature-Ed25519` and `X-Signature-Timestamp` headers to the request,
 * which contain the signature and timestamp of the request, respectively. The signature is calculated
 * using the provided CryptoKey object and the timestamp and body of the request.
 *
 * @param {Request} req - The request object to sign.
 * @param {CryptoKey} key - The CryptoKey object representing the private key to use for signing.
 * @returns {Promise<Request>} A promise that resolves to a new Request object with the signature and timestamp headers added.
 */
export const signRequest = async (req: Request, key: CryptoKey): Promise<Request> => {
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
