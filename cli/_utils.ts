import {Spinner} from 'jsr:@std/cli@0/spinner'
import 'jsr:@std/dotenv@0/load'
import {
  Locale,
  type RESTGetAPIApplicationCommandsResult,
  type RESTGetAPIOAuth2CurrentAuthorizationResult,
  type RESTPostAPIApplicationCommandsJSONBody,
  type RESTPostAPIApplicationCommandsResult,
  type RESTPostOAuth2ClientCredentialsResult,
} from 'npm:discord-api-types@0/v10'

export const clientId = Deno.env.get('CLIENT_ID')!
const clientSecret = Deno.env.get('CLIENT_SECRET')!

const waitToken = new Spinner({message: 'Get token'})

export const getToken = async () => {
  waitToken.start()
  const res = await fetch('https://discord.com/api/oauth2/token', {
    method: 'POST',
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      scope: 'identify applications.commands.update',
      client_id: clientId,
      client_secret: clientSecret,
    }),
  })

  if (!res.ok) throw await res.text()
  const token = await res.json()

  waitToken.stop()
  return token as RESTPostOAuth2ClientCredentialsResult
}

export const getMe = async (cred: RESTPostOAuth2ClientCredentialsResult) => {
  const res = await fetch('https://discord.com/api/oauth2/@me', {
    headers: {
      Authorization: `Bearer ${cred.access_token}`,
    },
  })

  if (!res.ok) throw await res.text()
  return (await res.json()) as RESTGetAPIOAuth2CurrentAuthorizationResult
}

export const getApplicationsCommands = async (
  token: RESTPostOAuth2ClientCredentialsResult,
  guild?: string
) => {
  const res = await fetch(
    guild
      ? `https://discord.com/api/v10/applications/${clientId}/guilds/${guild}/commands`
      : `https://discord.com/api/v10/applications/${clientId}/commands`,
    {
      headers: {
        authorization: `Bearer ${token.access_token}`,
      },
    }
  )

  return (await res.json()) as RESTGetAPIApplicationCommandsResult
}

export const postApplicationsCommands = async (
  token: RESTPostOAuth2ClientCredentialsResult,
  data: RESTPostAPIApplicationCommandsJSONBody,
  guild?: string
) => {
  const res = await fetch(
    guild
      ? `https://discord.com/api/v10/applications/${clientId}/guilds/${guild}/commands`
      : `https://discord.com/api/v10/applications/${clientId}/commands`,
    {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token.access_token}`,
        'content-type': 'application/json',
        'Accept-Language': Locale.EnglishUS,
      },
      body: JSON.stringify(data),
    }
  )

  return (await res.json()) as RESTPostAPIApplicationCommandsResult
}

export const deleteApplicationsCommands = async (
  token: RESTPostOAuth2ClientCredentialsResult,
  id: string,
  guild?: string
) => {
  const res = await fetch(
    guild
      ? `https://discord.com/api/v10/applications/${clientId}/guilds/${guild}/commands/${id}`
      : `https://discord.com/api/v10/applications/${clientId}/commands/${id}`,
    {
      method: 'DELETE',
      headers: {
        authorization: `Bearer ${token.access_token}`,
      },
    }
  )

  return res.ok
}
