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
  RESTPostAPIInteractionCallbackJSONBody,
  RESTPostAPIWebhookWithTokenResult,
  APIApplicationCommandInteractionDataOption,
  APIApplicationCommandInteractionDataBasicOption,
  APIApplicationCommandInteractionDataNumberOption,
  APIInteraction,
  ApplicationIntegrationType,
  InteractionType,
  ApplicationCommandType,
  APIInteractionDataResolvedGuildMember,
} from 'discord-api-types/v10'
import type {OptionToObject} from './types.ts'


/** Type guard for `APIApplicationCommandOption` */
export type PickType<T extends APIApplicationCommandOption, Type extends ApplicationCommandOptionType> = T extends T & {
  type: Type
}
  ? T
  : never

export class ApplicationCommandContext<
  C extends RESTPostAPIChatInputApplicationCommandsJSONBody | APIApplicationCommandOption,
  T extends APIApplicationCommandOption
> {
  command: C = {} as any
  /** Access to the original options */
  options: OptionToObject<T>
  constructor(readonly interaction: APIInteraction, command: C, options: OptionToObject<T>) {
    this.command = command
    this.options = options || {}
  }

  getOption<K extends keyof typeof this.options>(name: K): (typeof this.options)[K] {
    return this.options[name]
  }

  getString<K extends PickType<T, ApplicationCommandOptionType.String>['name']>(
    name: K
  ): T extends {name: K} ? T : never {
    return this.options[name]
  }

  getInteger<K extends PickType<T, ApplicationCommandOptionType.Integer>['name']>(
    name: K
  ): T extends {name: K} ? T : never {
    return this.options[name]
  }

  getBoolean<K extends PickType<T, ApplicationCommandOptionType.Boolean>['name']>(name: K) {}
  getUser<K extends PickType<T, ApplicationCommandOptionType.User>['name']>(
    name: K
  ): APIInteractionDataResolvedGuildMember | undefined {
    const interaction = this.interaction
    if (
      interaction.type === InteractionType.ApplicationCommand &&
      interaction.data.type === ApplicationCommandType.ChatInput
    ) {
      for (const option of interaction.data.options ?? []) {
        if (option.type === ApplicationCommandOptionType.User) {
          if (option.name === name) {
            return interaction.data.resolved?.members?.[option.value]
          }
        }
      }
    }
  }
  getChannel<K extends PickType<T, ApplicationCommandOptionType.Channel>['name']>(name: K) {}
  getRole<K extends PickType<T, ApplicationCommandOptionType.Role>['name']>(name: K) {}
  getMentionable<K extends PickType<T, ApplicationCommandOptionType.Mentionable>['name']>(name: K) {}
  getNumber<K extends PickType<T, ApplicationCommandOptionType.Number>['name']>(name: K) {
    return {} as APIApplicationCommandInteractionDataNumberOption
  }
  getAttachment<K extends PickType<T, ApplicationCommandOptionType.Attachment>['name']>(name: K) {}

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

// TODO
export class ApplicationCommandAutocompleteContext<T extends APIApplicationCommandOption> {
  constructor() {}

  getOption() {}

  autocomplete(data: APICommandAutocompleteInteractionResponseCallbackData): APIApplicationCommandAutocompleteResponse {
    return {
      type: InteractionResponseType.ApplicationCommandAutocompleteResult,
      data,
    }
  }
}

// TODO
export class MessageComponentContext {
  reply(data: APIInteractionResponseCallbackData): APIInteractionResponseChannelMessageWithSource {
    return {
      type: InteractionResponseType.ChannelMessageWithSource,
      data,
    }
  }
}

// TODO
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

// TODO
const createDeferredResponse = () => {
  /*
    TODO: https://discord.com/developers/docs/interactions/receiving-and-responding#create-interaction-response
    `https://discord.com/api/v10/interactions/{interaction.id}/{interaction.token}/callback`
    `https://discord.com/api/v10/interactions/{interaction.id}/{interaction.token}/messages/@original`
    `https://discord.com/api/v10/webhooks/{application.id}/{interaction.token}`
  */

  const send = async () => {
    const body = {
      type: InteractionResponseType.ChannelMessageWithSource,
      data: {},
    } satisfies RESTPostAPIInteractionCallbackJSONBody

    const res = await fetch(`https://discord.com/api/v10/interactions/{interaction.id}/{interaction.token}/callback`, {
      method: 'POST',
      body: JSON.stringify(body),
    })

    return res.ok ? ((await res.json()) as RESTPostAPIWebhookWithTokenResult) : await res.json()
  }

  const edit = () => {}
  const cancel = () => {}

  return {send, edit, cancel}
}
