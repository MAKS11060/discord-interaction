import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  InteractionResponseType,
  InteractionType,
  type APIApplicationCommandAutocompleteInteraction,
  type APIApplicationCommandAutocompleteResponse,
  type APIApplicationCommandInteraction,
  type APIApplicationCommandInteractionDataBasicOption,
  type APIApplicationCommandInteractionDataIntegerOption,
  type APIApplicationCommandInteractionDataNumberOption,
  type APIApplicationCommandInteractionDataStringOption,
  type APIApplicationCommandOption,
  type APIAttachment,
  type APICommandAutocompleteInteractionResponseCallbackData,
  type APIInteractionDataOptionBase,
  type APIInteractionDataResolvedChannel,
  type APIInteractionDataResolvedGuildMember,
  type APIInteractionResponseCallbackData,
  type APIInteractionResponseChannelMessageWithSource,
  type APIInteractionResponseDeferredChannelMessageWithSource,
  type APIInteractionResponseDeferredMessageUpdate,
  type APIInteractionResponseUpdateMessage,
  type APIMessage,
  type APIMessageComponentInteraction,
  type APIModalInteractionResponse,
  type APIModalInteractionResponseCallbackData,
  type APIModalSubmission,
  type APIModalSubmitInteraction,
  type APIRole,
  type APIUser,
  type ComponentType,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord-api-types/v10'
import {DeferredContext} from './deferred-context.ts'
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

type PickTypeWithAutocomplete<
  T extends APIApplicationCommandOption,
  Type extends ApplicationCommandOptionType
> = T extends T & {
  type: Type
  autocomplete: true
}
  ? T
  : never

type isRequiredOption<T extends APIApplicationCommandOption, R> = T extends {required: true}
  ? R
  : R | null

// TODO
// type extractChoices<T extends APIApplicationCommandOptionChoice> = T['name']

/**
 * Represents the context of an application command interaction.
 */
export class ApplicationCommandContext<
  C extends RESTPostAPIChatInputApplicationCommandsJSONBody | APIApplicationCommandOption,
  O extends APIApplicationCommandOption
> {
  constructor(
    /** Get raw interaction data */
    readonly interaction: APIApplicationCommandInteraction,
    readonly options: OptionToObject<O>,
    readonly payload: Record<string, APIApplicationCommandInteractionDataBasicOption>
  ) {}

  /**
   * Gets the user object for the application command interaction.
   * @returns {APIUser} The user object.
   */
  get user(): APIUser {
    return this.interaction?.user ?? (this.interaction.member?.user as APIUser)
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
    if (this.payload[name] && this.payload[name].type === ApplicationCommandOptionType.Boolean) {
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

  /**
   * Sends a new message in response to the application command interaction.
   * @param {APIInteractionResponseCallbackData} data - The data for the new message.
   * @returns {APIInteractionResponseChannelMessageWithSource} The interaction response object.
   */
  reply(data: APIInteractionResponseCallbackData): APIInteractionResponseChannelMessageWithSource {
    return {
      type: InteractionResponseType.ChannelMessageWithSource,
      data,
    }
  }

  /**
   * Replaces the current message with a new message in response to the application command interaction.
   * @param {APIInteractionResponseCallbackData} data - The data for the new message.
   * @returns {APIInteractionResponseUpdateMessage} The interaction response object.
   */
  replyUpdate(data: APIInteractionResponseCallbackData): APIInteractionResponseUpdateMessage {
    return {
      type: InteractionResponseType.UpdateMessage,
      data,
    }
  }

  /**
   * Defers the interaction response and calls the provided callback function with a DeferredContext object.
   * @param {(c: DeferredContext) => void | Promise<void>} callback - The callback function to call with the DeferredContext object.
   * @param {Pick<APIInteractionResponseCallbackData, 'flags'>} [data] - The data for the deferred interaction response.
   * @returns {APIInteractionResponseDeferredChannelMessageWithSource} The deferred interaction response object.
   */
  deferredReply(
    callback: (c: DeferredContext) => void | Promise<void>,
    data?: Pick<APIInteractionResponseCallbackData, 'flags'>
  ): APIInteractionResponseDeferredChannelMessageWithSource {
    callback(new DeferredContext(this.interaction))
    return {type: InteractionResponseType.DeferredChannelMessageWithSource, data}
  }

  /**
   * Creates a modal window in response to the application command interaction.
   *
   * WARNING calls all modal window handlers.
   * @param {APIModalInteractionResponseCallbackData} data - The data for the modal window.
   * @returns {APIModalInteractionResponse} The interaction response object.
   */
  modal(data: APIModalInteractionResponseCallbackData): APIModalInteractionResponse {
    return {
      type: InteractionResponseType.Modal,
      data,
    }
  }
}

/**
 * Represents the context of an application command autocomplete interaction.
 */
export class ApplicationCommandAutocompleteContext<O extends APIApplicationCommandOption> {
  constructor(
    readonly interaction: APIApplicationCommandAutocompleteInteraction,
    readonly payload: Record<string, APIApplicationCommandInteractionDataBasicOption>
  ) {}

  /**
   * Gets the value of a string option from the payload of the application command autocomplete interaction.
   * @template K - The name of the string option.
   * @param {K} name - The name of the string option.
   * @returns {isRequiredOption<O extends {name: K} ? O : never, APIApplicationCommandInteractionDataStringOption>} The value of the string option, or null if the option is not present or not a string option.
   */
  getString<K extends PickTypeWithAutocomplete<O, ApplicationCommandOptionType.String>['name']>(
    name: K
  ): isRequiredOption<
    O extends {name: K} ? O : never,
    APIApplicationCommandInteractionDataStringOption
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
   * Gets the value of an integer option from the payload of the application command autocomplete interaction.
   * @template K - The name of the integer option.
   * @param {K} name - The name of the integer option.
   * @returns {isRequiredOption<O extends {name: K} ? O : never, APIApplicationCommandInteractionDataIntegerOption>} The value of the integer option, or null if the option is not present or not an integer option.
   */
  getInteger<K extends PickTypeWithAutocomplete<O, ApplicationCommandOptionType.Integer>['name']>(
    name: K
  ): isRequiredOption<
    O extends {name: K} ? O : never,
    APIApplicationCommandInteractionDataIntegerOption
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
   * Gets the value of a number option from the payload of the application command autocomplete interaction.
   * @template K - The name of the number option.
   * @param {K} name - The name of the number option.
   * @returns {isRequiredOption<O extends {name: K} ? O : never, APIApplicationCommandInteractionDataNumberOption>} The value of the number option, or null if the option is not present or not a number option.
   */
  getNumber<K extends PickTypeWithAutocomplete<O, ApplicationCommandOptionType.Number>['name']>(
    name: K
  ): isRequiredOption<
    O extends {name: K} ? O : never,
    APIApplicationCommandInteractionDataNumberOption
  > {
    if (this.payload[name] && this.payload[name].type === ApplicationCommandOptionType.Number) {
      return this.payload[name] as APIInteractionDataOptionBase<
        ApplicationCommandOptionType.Number,
        number
      >
    }

    return null!
  }

  /**
   * Creates an application command autocomplete response with the given data.
   * @param {APICommandAutocompleteInteractionResponseCallbackData} data - The data for the autocomplete response.
   * @returns {APIApplicationCommandAutocompleteResponse} The application command autocomplete response.
   */
  autocomplete(
    data: APICommandAutocompleteInteractionResponseCallbackData
  ): APIApplicationCommandAutocompleteResponse {
    return {
      type: InteractionResponseType.ApplicationCommandAutocompleteResult,
      data,
    }
  }

  /**
   * Creates an empty application command autocomplete response.
   * @returns {APIApplicationCommandAutocompleteResponse} The empty application command autocomplete response.
   */
  pass(): APIApplicationCommandAutocompleteResponse {
    return this.autocomplete({choices: []})
  }
}

/**
 * Represents the context of a message component interaction.
 */
export class MessageComponentContext {
  constructor(readonly interaction: APIMessageComponentInteraction) {}

  /**
   * Gets the type of the message component.
   * @returns {ComponentType} The type of the message component.
   */
  get type(): ComponentType {
    return this.interaction.data.component_type
  }

  /**
   * Gets the custom ID of the message component.
   * @returns {string} The custom ID of the message component, which is a string with a maximum length of 100 characters.
   */
  get customId(): string {
    return this.interaction.data.custom_id
  }

  /**
   * Sends a new message in response to the message component interaction.
   * @param {APIInteractionResponseCallbackData} data - The data for the new message.
   * @returns {APIInteractionResponseChannelMessageWithSource} The interaction response object.
   */
  reply(data: APIInteractionResponseCallbackData): APIInteractionResponseChannelMessageWithSource {
    return {
      type: InteractionResponseType.ChannelMessageWithSource,
      data,
    }
  }

  /**
   * Replaces the current message with a new message in response to the message component interaction.
   * @param {APIInteractionResponseCallbackData} data - The data for the new message.
   * @returns {APIInteractionResponseUpdateMessage} The interaction response object.
   */
  replyUpdate(data: APIInteractionResponseCallbackData): APIInteractionResponseUpdateMessage {
    return {
      type: InteractionResponseType.UpdateMessage,
      data,
    }
  }

  /**
   * Defers the interaction response update and calls the provided callback function with a DeferredContext object.
   * @param {(c: DeferredContext) => void | Promise<void>} callback - The callback function to call with the DeferredContext object.
   * @returns {APIInteractionResponseDeferredMessageUpdate} The deferred interaction response update object.
   */
  deferredReplyUpdate(
    callback: (c: DeferredContext) => void | Promise<void>
  ): APIInteractionResponseDeferredMessageUpdate {
    callback(new DeferredContext(this.interaction))
    return {type: InteractionResponseType.DeferredMessageUpdate}
  }

  /**
   * Creates a modal window in response to the message component interaction.
   * @param {APIModalInteractionResponseCallbackData} data - The data for the modal window.
   * @returns {APIModalInteractionResponse} The interaction response object.
   */
  modal(data: APIModalInteractionResponseCallbackData): APIModalInteractionResponse {
    return {
      type: InteractionResponseType.Modal,
      data,
    }
  }
}

/**
 * Represents the context of a modal submit interaction.
 */
export class ModalContext {
  constructor(readonly interaction: APIModalSubmitInteraction, readonly data: APIModalSubmission) {}

  /**
   * Sends a new message in response to the modal submit interaction.
   * @param {APIInteractionResponseCallbackData} data - The data for the new message.
   * @returns {APIInteractionResponseChannelMessageWithSource} The interaction response object.
   */
  reply(data: APIInteractionResponseCallbackData): APIInteractionResponseChannelMessageWithSource {
    return {
      type: InteractionResponseType.ChannelMessageWithSource,
      data,
    }
  }

  /**
   * Defers the interaction response and calls the provided callback function with a DeferredContext object.
   * @param {(c: DeferredContext) => void | Promise<void>} callback - The callback function to call with the DeferredContext object.
   * @param {Pick<APIInteractionResponseCallbackData, 'flags'>} [data] - The data for the deferred interaction response.
   * @returns {APIInteractionResponseDeferredChannelMessageWithSource} The deferred interaction response object.
   */
  deferredReply(
    callback: (c: DeferredContext) => void | Promise<void>,
    data?: Pick<APIInteractionResponseCallbackData, 'flags'>
  ): APIInteractionResponseDeferredChannelMessageWithSource {
    callback(new DeferredContext(this.interaction))
    return {type: InteractionResponseType.DeferredChannelMessageWithSource, data}
  }
}

class MenuCommandContext {
  constructor(
    readonly interaction: APIApplicationCommandInteraction,
    readonly payload: Record<string, APIApplicationCommandInteractionDataBasicOption>
  ) {}

  /**
   * Sends a new message in response to the context menu command interaction.
   * @param {APIInteractionResponseCallbackData} data - The data for the new message.
   * @returns {APIInteractionResponseChannelMessageWithSource} The interaction response object.
   */
  reply(data: APIInteractionResponseCallbackData): APIInteractionResponseChannelMessageWithSource {
    return {
      type: InteractionResponseType.ChannelMessageWithSource,
      data,
    }
  }
}

/**
 * Represents the context of a user context menu command interaction.
 */
export class UserMenuCommandContext extends MenuCommandContext {
  /**
   * Gets the user object for a user context menu command interaction.
   * @returns {APIUser} The user object.
   */
  getUser(): APIUser {
    const {type, data} = this.interaction
    if (type !== InteractionType.ApplicationCommand) return null!
    if (data.type !== ApplicationCommandType.User) return null!
    return data.resolved.users[data.target_id]
  }

  /**
   * Gets the guild member object for a user context menu command interaction.
   * @returns {APIInteractionDataResolvedGuildMember | void} Returns the guild member object only if the interaction is a user context menu command interaction in a guild and the guild member object is present.
   */
  getMember(): APIInteractionDataResolvedGuildMember | void {
    const {type, data} = this.interaction
    if (type !== InteractionType.ApplicationCommand) return null!
    if (data.type !== ApplicationCommandType.User) return null!
    return data.resolved.members?.[data.target_id]
  }
}

/**
 * Represents the context of a message context menu command interaction.
 */
export class MessageMenuCommandContext extends MenuCommandContext {
  /**
   * Gets the message object for a message context menu command interaction.
   * @returns {APIMessage} The message object, or null if the interaction is not a message context menu command interaction.
   */
  getMessage(): APIMessage {
    const {type, data} = this.interaction
    if (type !== InteractionType.ApplicationCommand) return null!
    if (data.type !== ApplicationCommandType.Message) return null!
    return data.resolved.messages[data.target_id]
  }
}
