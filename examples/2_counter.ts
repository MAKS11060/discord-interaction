import {
  ButtonStyle,
  ComponentType,
  type APIActionRowComponent,
  type APIMessageActionRowComponent,
} from 'discord-api-types/v10'
import {defineCommand} from '../mod.ts'

export const counter = defineCommand({
  name: 'counter',
  description: 'Create Counter',
}).createHandler({
  counter() {
    const initialState: APIActionRowComponent<APIMessageActionRowComponent>[] = [
      {
        type: ComponentType.ActionRow,
        components: [
          {
            type: ComponentType.Button,
            style: ButtonStyle.Danger,
            label: 'reset',
            custom_id: JSON.stringify(['reset']),
          },
          {
            type: ComponentType.Button,
            style: ButtonStyle.Success,
            label: 'clicks: 0',
            custom_id: JSON.stringify(['click', 0]),
          },
          {
            type: ComponentType.Button,
            style: ButtonStyle.Secondary,
            label: 'clone',
            custom_id: JSON.stringify(['clone', 0]),
          },
        ],
      },
    ]

    return {
      command(c) {
        return c.reply({components: initialState})
      },

      messageComponent(c) {
        const [id, counter] = JSON.parse(c.customId)

        if (id === 'reset') {
          return c.replyUpdate({components: initialState})
        }

        if (id === 'clone') {
          // copy current component and create new message
          return c.reply({
            components: c.interaction.message.components,
          })
        }

        if (id === 'click') {
          const clicks = Number(counter) + 1
          return c.replyUpdate({
            components: [
              {
                type: ComponentType.ActionRow,
                components: [
                  {
                    type: ComponentType.Button,
                    style: ButtonStyle.Danger,
                    label: 'reset',
                    custom_id: JSON.stringify(['reset']),
                  },
                  {
                    type: ComponentType.Button,
                    style: ButtonStyle.Success,
                    label: `clicks: ${clicks}`,
                    custom_id: JSON.stringify(['click', clicks]),
                  },
                  {
                    type: ComponentType.Button,
                    style: ButtonStyle.Secondary,
                    label: 'clone',
                    custom_id: JSON.stringify(['clone']),
                  },
                ],
              },
            ],
          })
        }
      },
    }
  },
})
