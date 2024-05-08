import {
APIActionRowComponent,
  APIEmbed,
  APIMessageActionRowComponent,
  ApplicationCommandOptionType,
  ApplicationCommandType,
  ButtonStyle,
  ComponentType,
  MessageFlags,
} from 'discord-api-types/v10'
import {defineCommand} from './builder.ts'
import {Danbooru, Post} from './ext/danbooru.ts'

const help = defineCommand({
  name: 'help',
  description: 'Show help',
}).createHandler(() => {
  return {
    command(c) {
      return c.reply({content: 'ok', flags: MessageFlags.Ephemeral})
    },
  }
})

const test = defineCommand({
  type: ApplicationCommandType.ChatInput,
  name: 'test',
  description: 'Test command',
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: 'str',
      description: 'str',
    },
    {
      type: ApplicationCommandOptionType.Integer,
      name: 'int',
      description: 'int',
    },
    {
      type: ApplicationCommandOptionType.Boolean,
      name: 'bool',
      description: 'bool',
    },
    {
      type: ApplicationCommandOptionType.User,
      name: 'user',
      description: 'sel user',
    },
    {
      type: ApplicationCommandOptionType.Channel,
      name: 'channel',
      description: 'Channel',
    },
    {
      type: ApplicationCommandOptionType.Role,
      name: 'role',
      description: 'Role',
    },
    {
      type: ApplicationCommandOptionType.Mentionable,
      name: 'mentionable',
      description: 'Mentionable',
    },
    {
      type: ApplicationCommandOptionType.Number,
      name: 'num',
      description: 'num',
    },
    {
      type: ApplicationCommandOptionType.Attachment,
      name: 'attachment',
      description: 'Attachment',
    },
    {
      type: ApplicationCommandOptionType.String,
      name: 'autocomplete',
      description: 'autocomplete',
      autocomplete: true,
    },
  ],
}).createHandler(() => {
  return {
    command(c) {
      return c.reply({
        content: `\`\`\`json\n${JSON.stringify(c.interaction.data, null, 2)}\n\`\`\``,
        components: [
          {
            type: ComponentType.ActionRow,
            components: [
              {
                type: ComponentType.Button,
                style: ButtonStyle.Danger,
                custom_id: '0',
                label: 'ER',
              },
            ],
          },
        ],
      })
    },
    messageComponent(c) {
      return c.replyUpdate({
        components: [
          {
            type: ComponentType.ActionRow,
            components: [
              {
                type: ComponentType.Button,
                style: ButtonStyle.Success,
                custom_id: '1',
                label: 'Ok',
              },
            ],
          },
        ],
      })
    },
    commandAutocomplete(c) {
      return c.autocomplete({
        choices: [
          {
            name: JSON.stringify(c.interaction.data.options).replaceAll('"', ' '),
            value: crypto.randomUUID(),
          },
          {
            name: crypto.randomUUID(),
            value: crypto.randomUUID(),
          },
          {
            name: crypto.randomUUID(),
            value: crypto.randomUUID(),
          },
        ],
      })
    },
  }
})

const sub = defineCommand({
  type: ApplicationCommandType.ChatInput,
  name: 'permissions',
  description: 'Get or edit permissions for a user or a role',
  options: [
    {
      type: ApplicationCommandOptionType.SubcommandGroup,
      name: 'user',
      description: 'Get or edit permissions for a user',
      options: [
        {
          type: ApplicationCommandOptionType.Subcommand,
          name: 'get',
          description: 'Get permissions for a user',
          options: [
            {
              name: 'user',
              description: 'The user to get',
              type: ApplicationCommandOptionType.User,
              required: true,
            },
            {
              name: 'channel',
              description: 'The channel permissions to get. If omitted, the guild permissions will be returned',
              type: ApplicationCommandOptionType.Channel,
              required: false,
            },
          ],
        },
        {
          name: 'edit',
          description: 'Edit permissions for a user',
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: 'user',
              description: 'The user to edit',
              type: ApplicationCommandOptionType.User,
              required: true,
            },
            {
              name: 'channel',
              description: 'The channel permissions to edit. If omitted, the guild permissions will be edited',
              type: ApplicationCommandOptionType.Channel,
              required: false,
            },
          ],
        },
      ],
    },
  ],
}).createHandler(() => {
  return {
    command(c) {
      return c.reply({content: 'ok'})
    },
  }
})

const sub2 = defineCommand({
  type: ApplicationCommandType.ChatInput,
  name: 'sub2',
  description: 'sub2',
  options: [
    {
      type: ApplicationCommandOptionType.Subcommand,
      name: 's1',
      description: 'sub 1',
      options: [
        {
          type: ApplicationCommandOptionType.String,
          name: 'str',
          description: 'str',
        },
        {
          type: ApplicationCommandOptionType.String,
          name: 'name',
          description: 'Name',
          min_length: 1,
          max_length: 20,
        },
        {
          type: ApplicationCommandOptionType.Integer,
          name: 'int',
          description: 'Int',
          min_value: 1,
          max_value: 10,
        },
      ],
    },
    {
      type: ApplicationCommandOptionType.Subcommand,
      name: 's2',
      description: 'sub 2',
      options: [
        {
          type: ApplicationCommandOptionType.String,
          name: 'str',
          description: 'str',
        },
        {
          type: ApplicationCommandOptionType.String,
          name: 'str2',
          description: 'str2',
        },
      ],
    },
  ],
}).createHandler(() => {
  return {
    command(c) {
      return c.reply({content: 'ok'})
    },
  }
})

const animeArt = defineCommand({
  type: ApplicationCommandType.ChatInput,
  name: 'art',
  description: 'Get anime art',
  options: [
    // {
    //   type: ApplicationCommandOptionType.Subcommand,
    //   name: 'random',
    //   description: 'Get random art',
    // },
    // {
    //   type: ApplicationCommandOptionType.Subcommand,
    //   name: 'fav',
    //   description: 'User random favorites',
    //   options: [
    //     {
    //       type: ApplicationCommandOptionType.String,
    //       name: 'user',
    //       description: 'username',
    //       required: true,
    //       max_length: 80,
    //       // autocomplete: true,
    //     },
    //   ],
    // },
    {
      type: ApplicationCommandOptionType.Subcommand,
      name: 'post',
      description: 'Post by id',
      options: [
        {
          type: ApplicationCommandOptionType.Number,
          name: 'id',
          description: 'Post id',
          required: true,
        },
      ],
    },
  ],
}).createHandler((c) => {
  const danbooru = new Danbooru({
    login: Deno.env.get('DANBOOURU_LOGIN')!,
    apikey: Deno.env.get('DANBOOURU_APIKEY')!,
  })

  const ArtButtonIds = {
    rand: 'rand',
    next: 'next',
    save: 'save',
  } as const

  const getEmbeds = (img: Post | null) => {
    // const img = await danbooru.saveSearchPosts()
    // const img = await danbooru.userFavorites('maks11060')
    const url = new URL(`/posts`, danbooru.origin.origin)
    url.searchParams.set('tags', `${img?.tag_string_artist}`)

    return [
      {
        image: {url: img?.file_url!},
        url: new URL(`/posts/${img?.id}`, danbooru.origin.origin).toString(),
        author: {
          name: `${img?.tag_string_artist}`,
          url: url.toString(),
        },
        title: `${img?.tag_string_character?.replaceAll('_', ' ') || `posts/${img?.id}`}`,
        color: 7763574,
      },
    ] as APIEmbed[]
  }

  /** [Save Next Random] */
  const getComponents = () =>
    [
      {
        type: ComponentType.ActionRow,
        components: [
          {
            label: 'Save',
            custom_id: ArtButtonIds.save,
            style: ButtonStyle.Success,
            type: ComponentType.Button,
          },
          {
            label: 'Next',
            custom_id: ArtButtonIds.next,
            style: ButtonStyle.Primary,
            type: ComponentType.Button,
          },
          {
            label: 'Random',
            custom_id: ArtButtonIds.rand,
            style: ButtonStyle.Secondary,
            type: ComponentType.Button,
          },
        ],
      },
    ] as APIActionRowComponent<APIMessageActionRowComponent>[]

  const setCustomId = (id: typeof ArtButtonIds, val?: string) => JSON.stringify({id, val})
  const getCustomId = (raw: string) => {
    try {
      return JSON.parse(raw) as {
        id: string
        val?: string
      }
    } catch (e) {
      return {
        id: raw,
      }
    }
  }

  return {
    async command(c) {
      c.get('post')

      return c.reply({
        embeds: getEmbeds(await danbooru.saveSearchPosts()),
        components: getComponents(),
      })
    },
    // messageComponent(c) {
    //   return c.replyUpdate({
    //     components: getComponents(),
    //   })
    // },
  }
})

export const commands = [help, test, sub, sub2, animeArt]
