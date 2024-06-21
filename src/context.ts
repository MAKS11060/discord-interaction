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
  APIModalSubmission,
  APIInteractionDataOptionBase,
  APIApplicationCommandBasicOption,
  APIApplicationCommandOptionChoice,
  APIUser,
  APIInteractionDataResolvedChannel,
  APIRole,
  APIAttachment,
} from 'discord-api-types/v10'
import type {OptionToObject} from './types.ts'

/** Type guard for `APIApplicationCommandOption` */
type PickType<T extends APIApplicationCommandOption, Type extends ApplicationCommandOptionType> = T extends T & {
  type: Type
}
  ? T
  : never

type isRequiredOption<T extends APIApplicationCommandOption, R> = T extends {required: true} ? R : R | null

type extractChoices<T extends APIApplicationCommandOptionChoice> = T['name']

export class ApplicationCommandContext<
  C extends RESTPostAPIChatInputApplicationCommandsJSONBody | APIApplicationCommandOption,
  T extends APIApplicationCommandOption
> {
  command: C = {} as any
  constructor(readonly interaction: APIInteraction, command: C) {
    this.command = command
  }

  /**
   * Get `String`
   */
  getString<K extends PickType<T, ApplicationCommandOptionType.String>['name']>(
    name: K
  ): isRequiredOption<T, APIInteractionDataOptionBase<ApplicationCommandOptionType.String, string>> {
    const interaction = this.interaction
    if (interaction.type !== InteractionType.ApplicationCommand) return null!
    if (interaction.data.type !== ApplicationCommandType.ChatInput) return null!

    for (const option of interaction.data.options ?? []) {
      if (option.type === ApplicationCommandOptionType.String && option.name === name) {
        return option
      }
    }

    return null!
  }

  /**
   * Get `Integer` between -2^53 and 2^53
   */
  getInteger<K extends PickType<T, ApplicationCommandOptionType.Integer>['name']>(
    name: K
  ): isRequiredOption<T, APIInteractionDataOptionBase<ApplicationCommandOptionType.Integer, number>> {
    const interaction = this.interaction
    if (interaction.type !== InteractionType.ApplicationCommand) return null!
    if (interaction.data.type !== ApplicationCommandType.ChatInput) return null!

    for (const option of interaction.data.options ?? []) {
      if (option.type === ApplicationCommandOptionType.Integer && option.name === name) {
        return option
      }
    }
    return null!
  }

  /**
   * Get `Boolean`
   */
  getBoolean<K extends PickType<T, ApplicationCommandOptionType.Boolean>['name']>(
    name: K
  ): isRequiredOption<T, APIInteractionDataOptionBase<ApplicationCommandOptionType.Boolean, boolean>> {
    const interaction = this.interaction
    if (interaction.type !== InteractionType.ApplicationCommand) return null!
    if (interaction.data.type !== ApplicationCommandType.ChatInput) return null!

    for (const option of interaction.data.options ?? []) {
      if (option.type === ApplicationCommandOptionType.Boolean && option.name === name) {
        return option
      }
    }
    return null!
  }

  /**
   * Get `User`
   */
  getUser<K extends PickType<T, ApplicationCommandOptionType.User>['name']>(name: K): APIUser | undefined {
    const interaction = this.interaction
    if (interaction.type !== InteractionType.ApplicationCommand) return null!
    if (interaction.data.type !== ApplicationCommandType.ChatInput) return null!

    for (const option of interaction.data.options ?? []) {
      if (option.type === ApplicationCommandOptionType.User && option.name === name) {
        return interaction.data.resolved?.users?.[option.value]
      }
    }
  }

  /**
   * Get Guild `Member` object
   */
  getMember<K extends PickType<T, ApplicationCommandOptionType.User>['name']>(
    name: K
  ): APIInteractionDataResolvedGuildMember | undefined {
    const interaction = this.interaction
    if (interaction.type !== InteractionType.ApplicationCommand) return null!
    if (interaction.data.type !== ApplicationCommandType.ChatInput) return null!

    for (const option of interaction.data.options ?? []) {
      if (option.type === ApplicationCommandOptionType.User && option.name === name) {
        return interaction.data.resolved?.members?.[option.value]
      }
    }
  }

  /**
   * Get `Channel`
   */
  getChannel<K extends PickType<T, ApplicationCommandOptionType.Channel>['name']>(
    name: K
  ): APIInteractionDataResolvedChannel | undefined {
    const interaction = this.interaction
    if (interaction.type !== InteractionType.ApplicationCommand) return null!
    if (interaction.data.type !== ApplicationCommandType.ChatInput) return null!

    for (const option of interaction.data.options ?? []) {
      if (option.type === ApplicationCommandOptionType.Channel && option.name === name) {
        return interaction.data.resolved?.channels?.[option.value]
      }
    }
  }

  /**
   * Get `Role`
   */
  getRole<K extends PickType<T, ApplicationCommandOptionType.Role>['name']>(name: K): APIRole | undefined {
    const interaction = this.interaction
    if (interaction.type !== InteractionType.ApplicationCommand) return null!
    if (interaction.data.type !== ApplicationCommandType.ChatInput) return null!

    for (const option of interaction.data.options ?? []) {
      if (option.type === ApplicationCommandOptionType.Role && option.name === name) {
        return interaction.data.resolved?.roles?.[option.value]
      }
    }
  }

  /**
   * Get `User` or `Role`
   */
  getMentionable<K extends PickType<T, ApplicationCommandOptionType.Mentionable>['name']>(
    name: K
  ): APIUser | APIRole | undefined {
    const interaction = this.interaction
    if (interaction.type !== InteractionType.ApplicationCommand) return null!
    if (interaction.data.type !== ApplicationCommandType.ChatInput) return null!

    for (const option of interaction.data.options ?? []) {
      if (option.type === ApplicationCommandOptionType.Mentionable && option.name === name) {
        // TODO resolved[users or member] ???
        return interaction.data.resolved?.users?.[option.value] ?? interaction.data.resolved?.roles?.[option.value]
      }
    }
  }

  /** Any double between -2^53 and 2^53 */
  getNumber<K extends PickType<T, ApplicationCommandOptionType.Number>['name']>(
    name: K
  ): isRequiredOption<T, APIInteractionDataOptionBase<ApplicationCommandOptionType.Number, number>> {
    const interaction = this.interaction
    if (interaction.type !== InteractionType.ApplicationCommand) return null!
    if (interaction.data.type !== ApplicationCommandType.ChatInput) return null!

    for (const option of interaction.data.options ?? []) {
      if (option.type === ApplicationCommandOptionType.Number && option.name === name) {
        return option
      }
    }
    return null!
  }

  getAttachment<K extends PickType<T, ApplicationCommandOptionType.Attachment>['name']>(
    name: K
  ): APIAttachment | undefined {
    const interaction = this.interaction
    if (interaction.type !== InteractionType.ApplicationCommand) return null!
    if (interaction.data.type !== ApplicationCommandType.ChatInput) return null!

    for (const option of interaction.data.options ?? []) {
      if (option.type === ApplicationCommandOptionType.Attachment && option.name === name) {
        return interaction.data.resolved?.attachments?.[option.value]
      }
    }
  }

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

  /**
   * Create `modal` window. WARNING calls all modal window handlers.
   */
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

export class MessageComponentContext {
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

  /**
   * Create `modal` window.
   */
  modal(data: APIModalInteractionResponseCallbackData): APIModalInteractionResponse {
    return {
      type: InteractionResponseType.Modal,
      data,
    }
  }
}

// TODO
export class ModalContext {
  constructor(readonly data: APIModalSubmission) {}

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
