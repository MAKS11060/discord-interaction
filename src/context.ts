import {
  APIApplicationCommandInteractionDataBasicOption,
  ApplicationCommandOptionType,
  ApplicationCommandType,
  InteractionResponseType,
  InteractionType,
  type APIApplicationCommandAutocompleteResponse,
  type APIApplicationCommandOption,
  type APIAttachment,
  type APICommandAutocompleteInteractionResponseCallbackData,
  type APIInteraction,
  type APIInteractionDataOptionBase,
  type APIInteractionDataResolvedChannel,
  type APIInteractionDataResolvedGuildMember,
  type APIInteractionResponseCallbackData,
  type APIInteractionResponseChannelMessageWithSource,
  type APIInteractionResponseDeferredChannelMessageWithSource,
  type APIInteractionResponseDeferredMessageUpdate,
  type APIInteractionResponseUpdateMessage,
  type APIModalInteractionResponse,
  type APIModalInteractionResponseCallbackData,
  type APIModalSubmission,
  type APIRole,
  type APIUser,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
  type RESTPostAPIContextMenuApplicationCommandsJSONBody,
  type RESTPostAPIInteractionCallbackJSONBody,
  type RESTPostAPIWebhookWithTokenResult,
} from 'discord-api-types/v10'
import type {OptionToObject} from './types.ts'

/** Type guard for `APIApplicationCommandOption` */
type PickType<
  T extends APIApplicationCommandOption,
  Type extends ApplicationCommandOptionType
> = T extends T & {
  type: Type
}
  ? T
  : never

type isRequiredOption<T extends APIApplicationCommandOption, R> = T extends {required: true}
  ? R
  : R | null

// type extractChoices<T extends APIApplicationCommandOptionChoice> = T['name']

export class ApplicationCommandContext<
  C extends RESTPostAPIChatInputApplicationCommandsJSONBody | APIApplicationCommandOption,
  O extends APIApplicationCommandOption
> {
  // r: C = {} as any
  constructor(
    /** Get raw interaction data */
    readonly interaction: APIInteraction,
    readonly options: OptionToObject<O>,
    readonly payload: Record<string, APIApplicationCommandInteractionDataBasicOption>
  ) {
    // console.log({options, payload})
  }

  /**
   * Get `String`
   */
  getString<K extends PickType<O, ApplicationCommandOptionType.String>['name']>(
    name: K
  ): isRequiredOption<
    O extends {name: K} ? O : never,
    APIInteractionDataOptionBase<ApplicationCommandOptionType.String, string>
  > {
    if (this.payload[name] && this.payload[name].type === ApplicationCommandOptionType.String) {
      return this.payload[name] as APIInteractionDataOptionBase<
        ApplicationCommandOptionType.String,
        string
      >
    }

    return null!
  }

  /**
   * Get `Integer` between -2^53 and 2^53
   */
  getInteger<K extends PickType<O, ApplicationCommandOptionType.Integer>['name']>(
    name: K
  ): isRequiredOption<
    O extends {name: K} ? O : never,
    APIInteractionDataOptionBase<ApplicationCommandOptionType.Integer, number>
  > {
    if (this.payload[name] && this.payload[name].type === ApplicationCommandOptionType.Integer) {
      return this.payload[name] as APIInteractionDataOptionBase<
        ApplicationCommandOptionType.Integer,
        number
      >
    }

    return null!
  }

  /**
   * Get `Boolean`
   */
  getBoolean<K extends PickType<O, ApplicationCommandOptionType.Boolean>['name']>(
    name: K
  ): isRequiredOption<
    O extends {name: K} ? O : never,
    APIInteractionDataOptionBase<ApplicationCommandOptionType.Boolean, boolean>
  > {
    if (this.payload[name] && this.payload[name].type === ApplicationCommandOptionType.Integer) {
      return this.payload[name] as APIInteractionDataOptionBase<
        ApplicationCommandOptionType.Boolean,
        boolean
      >
    }

    return null!
  }

  /**
   * Get `User`
   */
  getUser<K extends PickType<O, ApplicationCommandOptionType.User>['name']>(
    name: K
  ): isRequiredOption<O extends {name: K} ? O : never, APIUser> {
    const interaction = this.interaction
    if (interaction.type !== InteractionType.ApplicationCommand) return null!
    if (interaction.data.type !== ApplicationCommandType.ChatInput) return null!

    if (this.payload[name]?.type === ApplicationCommandOptionType.User) {
      return interaction.data.resolved?.users?.[this.payload[name].value as string] ?? null!
    }

    return null!
  }

  /**
   * Get Guild `Member` object
   */
  getMember<K extends PickType<O, ApplicationCommandOptionType.User>['name']>(
    name: K
  ): isRequiredOption<O extends {name: K} ? O : never, APIInteractionDataResolvedGuildMember> {
    const interaction = this.interaction
    if (interaction.type !== InteractionType.ApplicationCommand) return null!
    if (interaction.data.type !== ApplicationCommandType.ChatInput) return null!

    if (this.payload[name]?.type === ApplicationCommandOptionType.User) {
      return interaction.data.resolved?.members?.[this.payload[name].value as string] ?? null!
    }

    return null!
  }

  /**
   * Get `Channel`
   */
  getChannel<K extends PickType<O, ApplicationCommandOptionType.Channel>['name']>(
    name: K
  ): isRequiredOption<O extends {name: K} ? O : never, APIInteractionDataResolvedChannel> {
    const interaction = this.interaction
    if (interaction.type !== InteractionType.ApplicationCommand) return null!
    if (interaction.data.type !== ApplicationCommandType.ChatInput) return null!

    if (this.payload[name]?.type === ApplicationCommandOptionType.Channel) {
      return interaction.data.resolved?.channels?.[this.payload[name].value as string] ?? null!
    }

    return null!
  }

  /**
   * Get `Role`
   */
  getRole<K extends PickType<O, ApplicationCommandOptionType.Role>['name']>(
    name: K
  ): isRequiredOption<O extends {name: K} ? O : never, APIRole> {
    const interaction = this.interaction
    if (interaction.type !== InteractionType.ApplicationCommand) return null!
    if (interaction.data.type !== ApplicationCommandType.ChatInput) return null!

    if (this.payload[name]?.type === ApplicationCommandOptionType.Role) {
      return interaction.data.resolved?.roles?.[this.payload[name].value as string] ?? null!
    }

    return null!
  }

  /**
   * Get `User` or `Role`
   */
  getMentionable<K extends PickType<O, ApplicationCommandOptionType.Mentionable>['name']>(
    name: K
  ): isRequiredOption<O extends {name: K} ? O : never, APIUser | APIRole> {
    const interaction = this.interaction
    if (interaction.type !== InteractionType.ApplicationCommand) return null!
    if (interaction.data.type !== ApplicationCommandType.ChatInput) return null!

    if (this.payload[name]?.type === ApplicationCommandOptionType.Mentionable) {
      // TODO resolved[users or member] ???
      return (
        interaction.data.resolved?.users?.[this.payload[name].value as string] ??
        interaction.data.resolved?.roles?.[this.payload[name].value as string] ??
        null!
      )
    }

    return null!
  }

  /** Any double between -2^53 and 2^53 */
  getNumber<K extends PickType<O, ApplicationCommandOptionType.Number>['name']>(
    name: K
  ): isRequiredOption<
    O extends {name: K} ? O : never,
    APIInteractionDataOptionBase<ApplicationCommandOptionType.Number, number>
  > {
    const interaction = this.interaction
    if (interaction.type !== InteractionType.ApplicationCommand) return null!
    if (interaction.data.type !== ApplicationCommandType.ChatInput) return null!

    if (this.payload[name]?.type === ApplicationCommandOptionType.Number) {
      return this.payload[name] as APIInteractionDataOptionBase<
        ApplicationCommandOptionType.Number,
        number
      >
    }

    return null!
  }

  /**
   * Get `Attachment` data
   */
  getAttachment<K extends PickType<O, ApplicationCommandOptionType.Attachment>['name']>(
    name: K
  ): isRequiredOption<O extends {name: K} ? O : never, APIAttachment> {
    const interaction = this.interaction
    if (interaction.type !== InteractionType.ApplicationCommand) return null!
    if (interaction.data.type !== ApplicationCommandType.ChatInput) return null!

    if (this.payload[name]?.type === ApplicationCommandOptionType.Attachment) {
      return interaction.data.resolved?.attachments?.[this.payload[name].value as string] ?? null!
    }

    return null!
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

  autocomplete(
    data: APICommandAutocompleteInteractionResponseCallbackData
  ): APIApplicationCommandAutocompleteResponse {
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

export class ContextMenuCommandContext<
  C extends RESTPostAPIContextMenuApplicationCommandsJSONBody
> {
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

    const res = await fetch(
      `https://discord.com/api/v10/interactions/{interaction.id}/{interaction.token}/callback`,
      {
        method: 'POST',
        body: JSON.stringify(body),
      }
    )

    return res.ok ? ((await res.json()) as RESTPostAPIWebhookWithTokenResult) : await res.json()
  }

  const edit = () => {}
  const cancel = () => {}

  return {send, edit, cancel}
}
