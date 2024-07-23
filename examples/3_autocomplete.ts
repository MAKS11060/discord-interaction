import {ApplicationCommandOptionType} from 'discord-api-types/v10'
import {defineCommand} from '../mod.ts'

export const autocomplete = defineCommand({
  name: 'autocomplete',
  description: 'Autocomplete Test',
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: 'str',
      description: 'str',
      autocomplete: true,
    },
    {
      type: ApplicationCommandOptionType.String,
      name: 't',
      description: 'str',
      choices: [
        {name: 'ch1', value: '1'},
        {name: 'ch2', value: '2'},
      ],
    },
    {
      type: ApplicationCommandOptionType.Integer,
      name: 'int',
      description: 'int',
      autocomplete: true,
    },
    {
      type: ApplicationCommandOptionType.Number,
      name: 'num',
      description: 'num',
      autocomplete: true,
    },
  ],
}).createHandler({
  autocomplete: () => ({
    command(c) {
      return c.reply({content: ''})
    },
    autocomplete(c) {
      const str = c.getString('str')!
      if (str.focused) {
        const uuid = crypto.randomUUID()
        return c.autocomplete({
          choices: [
            {name: 'hello', value: 'hello'},
            {name: 'autocomplete', value: 'autocomplete'},
            {name: uuid, value: uuid},
          ],
        })
      }

      const num = c.getInteger('int')!
      if (num.focused) {
        return c.autocomplete({
          choices: [
            {name: '0', value: 0},
            {name: '2', value: 2},
            {name: '4', value: 4},
          ],
        })
      }

      return c.pass()
    },
  }),
})

export const autocomplete2 = defineCommand({
  name: 'autocomplete2',
  description: 'Autocomplete Test',
  options: [
    {
      type: ApplicationCommandOptionType.SubcommandGroup,
      name: 'sub-g',
      description: 'group',
      options: [
        {
          type: ApplicationCommandOptionType.Subcommand,
          name: 'sub',
          description: 'sub',
          options: [
            {
              type: ApplicationCommandOptionType.String,
              name: 'str',
              description: 'str',
              autocomplete: true,
            },
          ],
        },
      ],
    },
    {
      type: ApplicationCommandOptionType.Subcommand,
      name: 'sub',
      description: 'sub',
      options: [
        {
          type: ApplicationCommandOptionType.String,
          name: 'str',
          description: 'str',
          autocomplete: true,
        },
      ],
    },
  ],
}).createHandler({
  autocomplete2: {
    'sub-g': {
      sub: () => ({
        command(c) {
          return c.reply({content: ''})
        },
        autocomplete(c) {
          if (c.getString('str')?.focused) {
            const uuid = crypto.randomUUID()
            return c.autocomplete({
              choices: [
                {name: 'hello', value: 'hello'},
                {name: 'autocomplete', value: 'autocomplete'},
                {name: uuid, value: uuid},
              ],
            })
          }

          return c.pass()
        },
      }),
    },
    sub: () => ({
      command(c) {
        return c.reply({content: ''})
      },
      autocomplete(c) {
        if (c.getString('str')?.focused) {
          const uuid = crypto.randomUUID()
          return c.autocomplete({
            choices: [
              {name: 'hello2', value: 'hello'},
              {name: 'autocomplete2', value: 'autocomplete'},
              {name: uuid, value: uuid},
            ],
          })
        }

        return c.pass()
      },
    }),
  },
})
