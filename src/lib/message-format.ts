/**
 * @example
 * ```ts
 * format.user('80351110224678912') // <@80351110224678912>
 * ```
 */
const user = (user_id: string): string => `<@${user_id}>`

/**
 * @example
 * ```ts
 * format.channel('80351110224678912') // <#103735883630395392>
 * ```
 */
const channel = (channel_id: string): string => `<#${channel_id}>`

/**
 * @example
 * ```ts
 * format.role('80351110224678912') // <@&103735883630395392>
 * ```
 */
const role = (role_id: string): string => `<@&${role_id}>`

/**
 * @example
 * ```ts
 * format.slashCommand('airhorn', '816437322781949972') // </airhorn:816437322781949972>
 * format.slashCommand('airhorn sub', '816437322781949972') // </airhorn sub:816437322781949972>
 * format.slashCommand('airhorn sub_group sub', '816437322781949972') // </airhorn sub_group sub:816437322781949972>
 * ```
 */
const slashCommand = (name: string, command_id: string): string => `</${name}:${command_id}>`

/**
 * @example
 * ```ts
 * format.customEmoji('mmLol', '216154654256398347') // <:mmLol:216154654256398347>
 * ```
 */
const customEmoji = (name: string, command_id: string): string => `<:${name}:${command_id}>`

/**
 * @example
 * ```ts
 * format.customAnimatedEmoji('mmLol', '216154654256398347') // <a:mmLol:216154654256398347>
 * ```
 */
const customAnimatedEmoji = (name: string, command_id: string): string =>
  `<a:${name}:${command_id}>`

/**
 * {@link https://discord.com/developers/docs/reference#message-formatting-timestamp-styles Discord timestamp format styles}
 */
export enum DateTimeFormat {
  /** Short time format (e.g. 16:20) */
  ShortTime = 't',
  /** Long time format (e.g. 16:20:30) */
  LongTime = 'T',
  /** Short date format (e.g. 20/04/2021) */
  ShortDate = 'd',
  /** Long date format (e.g. 20 April 2021) */
  LongDate = 'D',
  /** Short date/time format (e.g. 20 April 2021 16:20) */
  ShortDateTime = 'f',
  /** Long date/time format (e.g. Tuesday, 20 April 2021 16:20) */
  LongDateTime = 'F',
  /** Relative time format (e.g. 2 months ago) */
  RelativeTime = 'R',
}

/**
 * Converts a Date object or a Unix timestamp into a Discord timestamp format.
 *
 * @param {Date | number} time - A Date object or a Unix timestamp in seconds.
 * @param {DateTimeFormat} [style=DateTimeFormat.ShortDateTime] - The format of the timestamp.
 * @returns {string} A string formatted as a Discord timestamp.
 */
const timestamp = (
  time: Date | number,
  style: DateTimeFormat = DateTimeFormat.ShortDateTime
): string => {
  return time instanceof Date
    ? `<t:${Math.floor(time.getTime() / 1000)}:${style}>`
    : `<t:${Math.floor(time)}:${style}>`
}

/**
 * @example
 * ```ts
 * format.guildNavigation('mmLol', '216154654256398347') // <id:customize>
 * ```
 */
// const guildNavigation = (id: string, customize: string) => `<${id}:${customize}>`

/**
 * Message Formatting utils.
 * {@link https://discord.com/developers/docs/reference#message-formatting-formats Docs}
 */
export const format = {
  user,
  channel,
  role,
  slashCommand,
  customEmoji,
  customAnimatedEmoji,
  timestamp,
  // guildNavigation
}
