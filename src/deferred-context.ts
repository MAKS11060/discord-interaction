import type {
  APIInteraction,
  RESTPatchAPIInteractionFollowupJSONBody,
  RESTPatchAPIInteractionFollowupResult,
  RESTPatchAPIInteractionOriginalResponseJSONBody,
  RESTPatchAPIInteractionOriginalResponseResult,
  RESTPostAPIInteractionFollowupJSONBody,
  RESTPostAPIInteractionFollowupResult,
} from 'discord-api-types/v10'

const API = 'https://discord.com/api/v10'

type DeferredReplyContext = {
  /** Reply Response */
  response: RESTPatchAPIInteractionOriginalResponseResult
  /** Delete Message */
  delete(): Promise<boolean>
}

type DeferredReplyFollowupContext = {
  /** Followup Message Response */
  response: RESTPostAPIInteractionFollowupResult
  /** Delete Followup Message */
  delete(): Promise<boolean>
  /** Edit Followup Message */
  edit(
    data: RESTPatchAPIInteractionFollowupJSONBody
  ): Promise<RESTPatchAPIInteractionFollowupResult>
}

/** Delete Original Interaction Response */
const deleteOriginal = async (interaction: APIInteraction): Promise<boolean> => {
  const uri = `${API}/webhooks/${interaction.application_id}/${interaction.token}/messages/@original`
  const res = await fetch(uri, {method: 'DELETE', headers: {'content-type': 'application/json'}})
  return res.ok
}

/** Edit Followup Message */
const editMessage = async (
  interaction: APIInteraction,
  message_id: string,
  body: RESTPatchAPIInteractionFollowupJSONBody
) => {
  const uri = `${API}/webhooks/${interaction.application_id}/${interaction.token}/messages/${message_id}`
  const res = await fetch(uri, {
    method: 'PATCH',
    headers: {'content-type': 'application/json'},
    body: JSON.stringify(body),
  })
  if (!res.ok) throw await res.json()
  return (await res.json()) as RESTPatchAPIInteractionFollowupResult
}

/** Delete Followup Message */
const deleteFollowup = async (interaction: APIInteraction, message_id: string) => {
  const uri = `${API}/webhooks/${interaction.application_id}/${interaction.token}/messages/${message_id}`
  const res = await fetch(uri, {method: 'DELETE'})
  return res.ok
}

/**
 * Represents the context of a deferred interaction response.
 */
export class DeferredContext {
  constructor(readonly interaction: APIInteraction) {}

  /**
   * Edits the original interaction response.
   * @param {RESTPatchAPIInteractionOriginalResponseJSONBody} body - The data for the edited interaction response.
   * @returns {Promise<DeferredReplyContext>} A promise that resolves to a DeferredReplyContext object.
   */
  async reply(
    body: RESTPatchAPIInteractionOriginalResponseJSONBody
  ): Promise<DeferredReplyContext> {
    const uri = `${API}/webhooks/${this.interaction.application_id}/${this.interaction.token}/messages/@original`
    const res = await fetch(uri, {
      method: 'PATCH',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify(body),
    })
    if (!res.ok) throw await res.json()
    const data = (await res.json()) as RESTPatchAPIInteractionOriginalResponseResult
    return {
      response: data,
      delete: deleteOriginal.bind(null, this.interaction),
    }
  }

  /**
   * Creates a followup message.
   * @param {RESTPostAPIInteractionFollowupJSONBody} body - The data for the followup message.
   * @returns {Promise<DeferredReplyFollowupContext>} A promise that resolves to a DeferredReplyFollowupContext object.
   */
  async replyFollowup(
    body: RESTPostAPIInteractionFollowupJSONBody
  ): Promise<DeferredReplyFollowupContext> {
    const uri = `${API}/webhooks/${this.interaction.application_id}/${this.interaction.token}`
    const res = await fetch(uri, {
      method: 'POST',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify(body),
    })
    if (!res.ok) throw await res.json()
    const data = (await res.json()) as RESTPostAPIInteractionFollowupResult
    return {
      response: data,
      edit: editMessage.bind(null, this.interaction, data.id),
      delete: deleteFollowup.bind(null, this.interaction, data.id),
    }
  }
}
