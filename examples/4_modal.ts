import {ComponentType, TextInputStyle} from 'discord-api-types/v10'
import {delay} from 'jsr:@std/async/delay'
import {defineCommand} from '../mod.ts'

export const modal = defineCommand({
  name: 'modal',
  description: 'modal',
}).createHandler({
  modal() {
    return {
      command(c) {
        return c.modal({
          title: 'title',
          custom_id: 'modal-1',
          components: [
            {
              type: ComponentType.ActionRow,
              components: [
                {
                  type: ComponentType.TextInput,
                  custom_id: 'text-input',
                  label: 'text',
                  style: TextInputStyle.Paragraph,
                  placeholder: 'Text here...',
                  value: 'default',
                },
              ],
            },
          ],
        })
      },
      modalSubmit(c) {
        console.log(c.data)
        if (c.data.custom_id === 'modal-1') {
          for (const {type, components} of c.data.components) {
            if (type === ComponentType.ActionRow) {
              for (const component of components) {
                if (component.type === ComponentType.TextInput) {
                  if (component.custom_id === 'text-input') {
                    // return c.reply({content: `your text: ${component.value}`})

                    return c.deferredReply(async (c) => {
                      await delay(2000)
                      const reply = await c.reply({content: '123'})
                      await delay(2000)
                      const f = await c.replyFollowup({content: '123'})
                      await delay(2000)
                      await f.delete()
                      await reply.delete()

                      await c.replyFollowup({content: `your text: ${component.value}`})
                    })
                  }
                }
              }
            }
          }
        }
      },
    }
  },
})
