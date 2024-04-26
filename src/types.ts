export enum InteractionContextTypes {
  /**
   * Interaction can be used within servers
   */
  GUILD = 0,
  /**
   * Interaction can be used within DMs with the app's bot user
   */
  BOT_DM = 1,
  /**
   * Interaction can be used within Group DMs and DMs other than the app's bot user
   */
  PRIVATE_CHANNEL = 2,
}

export enum InteractionInstallContextTypes {
  /**
   * App is installable to servers
   */
  GUILD_INSTALL = 0,
  /**
   * App is installable to users
   */
  USER_INSTALL = 1,
}
