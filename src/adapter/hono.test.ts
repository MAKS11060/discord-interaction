#!/usr/bin/env -S deno test -A --watch
import {Hono} from 'npm:hono'
import {discordInteraction} from './hono.ts'
import {APIInteraction, InteractionType} from 'discord-api-types/v10'
import {assertEquals} from 'jsr:@std/assert'
import {signRequest} from '../lib/ed25519.ts'

const app = new Hono()

const keys = (await crypto.subtle.generateKey('Ed25519', false, ['sign', 'verify'])) as CryptoKeyPair
const key = keys.publicKey //await importKeyRaw(Deno.env.get('CLIENT_PUBLIC_KEY')!)

app.post('/interaction', ...discordInteraction(key, []))

Deno.test('ping', async (c) => {
  const body: APIInteraction = {
    type: InteractionType.Ping,
    app_permissions: '',
    application_id: '',
    entitlements: [],
    authorizing_integration_owners: {},
    id: '',
    token: '',
    version: 1,
  } satisfies APIInteraction

  const req = new Request('http://localhost/interaction', {
    method: 'POST',
    body: JSON.stringify(body),
  })

  await c.step('bad sign', async () => {
    const res = await app.fetch(req)
    assertEquals(res.status, 401)
    assertEquals(await res.json(), {error: 'Bad request signature'})
  })

  await c.step('sign', async () => {
    const res = await app.fetch(await signRequest(req, keys.privateKey))
    assertEquals(res.status, 200)
    assertEquals(await res.json(), {type: 1})
  })
})
