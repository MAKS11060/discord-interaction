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
  APIApplicationCommandOption,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  ApplicationCommandOptionType,
  RESTPostAPIContextMenuApplicationCommandsJSONBody,
} from 'discord-api-types/v10'
import type {isType} from './types.ts'

export class ApplicationCommandContext<
  C extends RESTPostAPIChatInputApplicationCommandsJSONBody | APIApplicationCommandOption,
  T extends APIApplicationCommandOption
> {
  command: C = {} as any
  options: T[]
  constructor(command: C, options?: T[]) {
    this.command = command
    this.options = options || []
  }

  // ===========
  getOption<K extends T['name']>(name: K): T extends {name: K} ? T : never {
    return this.options.find((option) => option.name === name) as any
  }

  getString<K extends isType<T, ApplicationCommandOptionType.String>['name']>(
    name: K
  ): T extends {name: K} ? T : never {
    return this.options.find(
      (option) => option.type === ApplicationCommandOptionType.String && option.name === name
    ) as any
  }

  getInteger<K extends isType<T, ApplicationCommandOptionType.Integer>['name']>(
    name: K
  ): T extends {name: K} ? T : never {
    return this.options.find(
      (option) => option.type === ApplicationCommandOptionType.Integer && option.name === name
    ) as any
  }
  // ===========

  /** Send a new message in response */
  reply(data: APIInteractionResponseCallbackData): APIInteractionResponseChannelMessageWithSource {
    return {
      type: InteractionResponseType.ChannelMessageWithSource,
      data,
    }
  }

  /** Replaces the current message */
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

  /** Create modal */
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

export class ContextMenuCommandContext<C extends RESTPostAPIContextMenuApplicationCommandsJSONBody> {
  command: C = {} as any
  constructor(command: C) {
    this.command = command
  }

  /** Send a new message in response */
  reply(data: APIInteractionResponseCallbackData): APIInteractionResponseChannelMessageWithSource {
    return {
      type: InteractionResponseType.ChannelMessageWithSource,
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
