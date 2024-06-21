import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  ButtonStyle,
  ComponentType,
  TextInputStyle,
} from 'discord-api-types/v10'
import {defineCommand} from '../mod.ts'
import {ulid} from 'jsr:@std/ulid'

const test1 = defineCommand({
  name: 'test1',
  description: 'test1',
}).createHandler({
  test1: () => {
    return {
      command: (c) => {
        return c.reply({
          content: '1',
          components: [
            {
              type: ComponentType.ActionRow,
              components: [
                {
                  type: ComponentType.Button,
                  style: ButtonStyle.Primary,
                  custom_id: 'btn',
                  label: 'Btn 1',
                },
              ],
            },
          ],
        })
      },
      messageComponent: (c) => {
        return c.reply({content: '1'})
      },
    }
  },
})

const test2 = defineCommand({
  name: 'test2',
  description: 'test2',
  options: [
    {type: ApplicationCommandOptionType.Subcommand, name: 'sub1', description: 'sub1'},
    {type: ApplicationCommandOptionType.Subcommand, name: 'sub2', description: 'sub2'},
  ],
}).createHandler({
  test2: {
    sub1: () => {
      return {
        command: (c) => {
          return c.reply({content: 'test2 sub1'})
        },
      }
    },
    sub2: () => {
      return {
        command: (c) => {
          return c.reply({
            content: 'test2 sub2',
            components: [
              {
                type: ComponentType.ActionRow,
                components: [
                  {
                    type: ComponentType.Button,
                    style: ButtonStyle.Primary,
                    custom_id: 'btn',
                    label: 'Open modal',
                  },
                ],
              },
            ],
          })
        },
        messageComponent: (c) => {
          return c.modal({
            title: 'modal',
            custom_id: 'modal',
            components: [
              {
                type: ComponentType.ActionRow,
                components: [
                  {
                    type: ComponentType.TextInput,
                    custom_id: 'input',
                    label: 'Input',
                    style: TextInputStyle.Paragraph,
                  },
                ],
              },
            ],
          })
        },
        modalSubmit: (c) => {
          console.log('modal')
          if (c.data.custom_id === 'input') {
            return c.reply({content: 'modal'})
          }
        },
      }
    },
  },
})

const test3 = defineCommand({
  name: 'test3',
  description: 'test3',
  options: [
    {
      type: ApplicationCommandOptionType.SubcommandGroup,
      name: 'sub-g1',
      description: 'sub g-1',
      options: [
        {type: ApplicationCommandOptionType.Subcommand, name: 'sub1', description: 'sub1'},
        {type: ApplicationCommandOptionType.Subcommand, name: 'sub2', description: 'sub2'},
      ],
    },
    {type: ApplicationCommandOptionType.Subcommand, name: 'sub1', description: 'sub1'},
    {type: ApplicationCommandOptionType.Subcommand, name: 'sub2', description: 'sub2'},
  ],
}).createHandler({
  test3: {
    'sub-g1': {
      sub1: () => ({
        command: (c) => c.reply({content: 'test3 sub-g1 sub1'}),
      }),
      sub2: () => ({
        // command: (c) => c.reply({content: 'test3 sub-g1 sub2'}),
        command: (c) => {
          return c.reply({
            content: 'test3 sub-g1 sub2',
            components: [
              {
                type: ComponentType.ActionRow,
                components: [
                  {
                    type: ComponentType.Button,
                    style: ButtonStyle.Primary,
                    custom_id: 'btn',
                    label: 'Btn 1',
                  },
                ],
              },
            ],
          })
        },
        messageComponent: (c) => {
          return c.replyUpdate({
            content: '3',
            components: [
              {
                type: ComponentType.ActionRow,
                components: [
                  {
                    type: ComponentType.Button,
                    style: ButtonStyle.Primary,
                    custom_id: 'btn',
                    label: 'Btn 2',
                  },
                ],
              },
            ],
          })
        },
        modalSubmit: (c) => {
          console.log('modal 2')

          return c.reply({content: 'modal 2'})
        },
      }),
    },
    sub1: (c) => ({
      command: (c) => c.reply({content: 'test3 sub1'}),
    }),
    sub2: () => ({
      command: (c) => c.reply({content: 'test3 sub2'}),
    }),
  },
})

const test4 = defineCommand({
  type: ApplicationCommandType.User,
  name: 'test4',
}).createHandler({
  test4: () => ({
    command: (c) => c.reply({content: '1'}),
  }),
})

const test5 = defineCommand({
  type: ApplicationCommandType.Message,
  name: 'test5',
}).createHandler({
  test5: () => ({
    command: (c) => c.reply({content: '1'}),
  }),
})

const test6 = defineCommand({
  name: 'test6',
  description: 'autocomplete',
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: 'str',
      description: 'str',
      // autocomplete: true // dynamic autocomplete handler
    },
    {
      type: ApplicationCommandOptionType.String,
      name: 'str2',
      description: 'str2',
      autocomplete: true, // dynamic autocomplete handler
    },
  ],
}).createHandler({
  test6: () => ({
    command: (c) => {
      return c.reply({content: '1'})
    },
    autocomplete: (c) => {
      return c.autocomplete({choices: []})
    },
  }),
})

const test7 = defineCommand({
  name: 'test7',
  description: 'Generate id',
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: 'format',
      description: 'select format',
      choices: [
        {name: 'uuid', value: 'uuid'},
        {name: 'ulid', value: 'ulid'},
      ],
      required: true,
    },
  ],
}).createHandler({
  test7: (o) => ({
    command: (c) => {
      const f = c.getString('format') // as (typeof o.format.choices)[number]['value']

      if (f === 'ulid') {
        return c.reply({content: `ulid \`\`\`${ulid()}\`\`\``})
      }
      if (f === 'uuid') {
        return c.reply({content: `uuid \`\`\`${crypto.randomUUID()}\`\`\``})
      }

      return c.reply({content: '1'})
    },
  }),
})

const all = defineCommand({
  name: 'all',
  description: 'All',
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: 'str',
      description: 'Str',
    },
    {
      type: ApplicationCommandOptionType.Integer,
      name: 'int',
      description: 'Int',
    },
    {
      type: ApplicationCommandOptionType.Boolean,
      name: 'bool',
      description: 'Bool',
    },
    {
      type: ApplicationCommandOptionType.User,
      name: 'user',
      description: 'User',
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
      name: 'number',
      description: 'Number',
    },
    {
      type: ApplicationCommandOptionType.Attachment,
      name: 'attachment',
      description: 'Attachment',
    },
  ],
}).createHandler({
  all: (opts) => ({
    command: (c) => {
      const s = c.getString('str')

      c.getString('str') && console.log('str', c.getString('str'))
      c.getInteger('int') && console.log('int', c.getInteger('int'))
      c.getBoolean('bool') && console.log('bool', c.getBoolean('bool'))

      c.getUser('user') && console.log('user', c.getUser('user'))
      c.getMember('user') && console.log('member', c.getMember('user'))

      c.getChannel('channel') && console.log('channel', c.getChannel('channel'))
      c.getRole('role') && console.log('role', c.getRole('role'))
      c.getMentionable('mentionable') && console.log('mentionable', c.getMentionable('mentionable'))
      c.getNumber('number') && console.log('number', c.getNumber('number'))

      c.getAttachment('attachment') && console.log('attachment', c.getAttachment('attachment'))

      return c.reply({content: `ok <t:${Math.floor(Date.now() / 1000)}:R>`})
    },
  }),
})

const all2 = defineCommand({
  name: 'all2',
  description: 'All2',
  options: [
    {
      type: ApplicationCommandOptionType.Subcommand,
      name: 'sub',
      description: 'Sub',
      options: [
        {
          type: ApplicationCommandOptionType.String,
          name: 'str',
          description: 'Str',
        },
        {
          type: ApplicationCommandOptionType.Integer,
          name: 'int',
          description: 'Int',
        },
        {
          type: ApplicationCommandOptionType.Boolean,
          name: 'bool',
          description: 'Bool',
        },
        {
          type: ApplicationCommandOptionType.User,
          name: 'user',
          description: 'User',
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
          name: 'number',
          description: 'Number',
        },
        {
          type: ApplicationCommandOptionType.Attachment,
          name: 'attachment',
          description: 'Attachment',
        },
      ],
    },
  ],
}).createHandler({
  all2: {
    sub: () => ({
      command: (c) => {
        console.log(c.getNumber('number').value)

        return c.reply({content: `ok <t:${Math.floor(Date.now() / 1000)}:R>`})
      },
    }),
  },
})

export const commands = [test1, test2, test3, test4, test5, all, all2, test7]
