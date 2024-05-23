import {
  APIInteractionResponseCallbackData,
  APIInteractionResponseChannelMessageWithSource,
  InteractionResponseType,
  APIInteractionResponseUpdateMessage,
  APICommandAutocompleteInteractionResponseCallbackData,
  APIApplicationCommandAutocompleteResponse,
  APIInteractionResponseDeferredMessageUpdate,
  APIInteractionResponseDeferredChannelMessageWithSource,
  APIModalInteractionResponseCallbackData,
  APIModalInteractionResponse,
} from 'discord-api-types/v10'

export class ApplicationCommandContext {
  /** send a message in response */
  reply(data: APIInteractionResponseCallbackData): APIInteractionResponseChannelMessageWithSource {
    return {
      type: InteractionResponseType.ChannelMessageWithSource,
      data,
    }
  }

  replyUpdate(data: APIInteractionResponseCallbackData): APIInteractionResponseUpdateMessage {
    return {
      type: InteractionResponseType.UpdateMessage,
      data,
    }
  }

  /* https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-response-object-interaction-callback-type */
  /* TODO: add a callback to interact with the response */
  deferredReply(
    data: Pick<APIInteractionResponseCallbackData, 'flags'>
  ): APIInteractionResponseDeferredChannelMessageWithSource {
    return {
      type: InteractionResponseType.DeferredChannelMessageWithSource,
      data,
    }
  }

  /* TODO: add a callback to interact with the response */
  deferredReplyUpdate(): APIInteractionResponseDeferredMessageUpdate {
    return {
      type: InteractionResponseType.DeferredMessageUpdate,
    }
  }

  modal(data: APIModalInteractionResponseCallbackData): APIModalInteractionResponse {
    return {
      type: InteractionResponseType.Modal,
      data,
    }
  }
}

export class ApplicationCommandAutocompleteContext {
  autocomplete(data: APICommandAutocompleteInteractionResponseCallbackData): APIApplicationCommandAutocompleteResponse {
    return {
      type: InteractionResponseType.ApplicationCommandAutocompleteResult,
      data,
    }
  }
}

export class MessageComponentContext {
  /* TODO */
}

export class ModalContext {
  reply(data: APIInteractionResponseCallbackData): APIInteractionResponseChannelMessageWithSource {
    return {
      type: InteractionResponseType.ChannelMessageWithSource,
      data,
    }
  }

  /* TODO: add a callback to interact with the response */
  deferredReply(
    data: Pick<APIInteractionResponseCallbackData, 'flags'>
  ): APIInteractionResponseDeferredChannelMessageWithSource {
    return {
      type: InteractionResponseType.DeferredChannelMessageWithSource,
      data,
    }
  }
}

/* TODO: use functions
const reply = (data: APIInteractionResponseCallbackData): APIInteractionResponseChannelMessageWithSource => {
  return {
    type: InteractionResponseType.ChannelMessageWithSource,
    data,
  }
}

const createApplicationCommandContext = () => {}
 */
