import {Hono} from 'hono'
import {assertEquals} from 'https://deno.land/std/assert/mod.ts'
import {decodeKeyHex} from 'https://raw.githubusercontent.com/MAKS11060/deno-libs/main/crypto/jwk.ts'
import {
  APIApplicationCommandInteraction,
  APIInteraction,
  ApplicationCommandType,
  ChannelType,
  InteractionType,
  Locale,
} from 'npm:discord-api-types/v10'
import {discordInteraction} from './src/interaction.ts'
import {importRawKey, signRequest} from './src/lib/ed25519.ts'

Deno.env.set(
  'CLIENT_PUBLIC_KEY',
  'b3bf8ca722129d4e520538422761a20dd1fc4d400a4cde67aee1d7647438af19'
)
Deno.env.set(
  'CLIENT_PRIVATE_KEY',
  'dbb1eef41645f0d2b9074a4c712f30029bf51e5e9f228564ac948ef28a53e109'
)

const app = new Hono()
const key = await importRawKey(Deno.env.get('CLIENT_PUBLIC_KEY')!)
const pKey = await decodeKeyHex({
  alg: 'Ed25519',
  public: Deno.env.get('CLIENT_PUBLIC_KEY')!,
  private: Deno.env.get('CLIENT_PRIVATE_KEY')!,
})

app.post('/interaction', ...discordInteraction(key))


Deno.test('ping', async (c) => {
  const body: APIInteraction = {
    type: InteractionType.Ping,
    id: '1',
    application_id: '1',
    entitlements: [],
    version: 1,
    token: crypto.randomUUID(),
  }

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
    const res = await app.fetch(await signRequest(req, pKey))
    assertEquals(res.status, 200)
    assertEquals(await res.json(), {type: 1})
  })
})

// Deno.test('test', async (c) => {
//   // const body: APIInteraction = {}
//   const body: APIApplicationCommandInteraction = {
//     type: InteractionType.ApplicationCommand,
//     data: {
//       type: ApplicationCommandType.ChatInput,
//       name: 'test',
//       id: '2',
//       resolved: {}
//     },
//     channel: {
//       type: ChannelType.DM,
//       id: '1',
//     },
//     locale: Locale.EnglishUS,
//     id: '1',
//     version: 1,
//     app_permissions: '',
//     application_id: '1',
//     entitlements: [],
//     user: {
//       id: '1',
//       avatar: '',
//       discriminator: '0',
//       username: '',
//       global_name: '',
//     },
//     token: crypto.randomUUID(),
//   }

//   const req = new Request('http://localhost/interaction', {
//     method: 'POST',
//     body: JSON.stringify(body),
//   })
//   const res = await app.fetch(await signRequest(req, pKey))
//   assertEquals(res.status, 200)

//   assertEquals(await res.json(), {type: 1})
// })
