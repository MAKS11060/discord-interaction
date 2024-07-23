import {ButtonStyle, ComponentType} from 'discord-api-types/v10'
import {delay} from 'jsr:@std/async/delay'
import {defineCommand} from '../mod.ts'

export const deferredReply = defineCommand({
  name: 'def-reply',
  description: 'def reply',
}).createHandler({
  'def-reply': () => ({
    command(c) {
      return c.deferredReply(async (c) => {
        await delay(2000)
        const a = await c.reply({content: 'edit'})
        await delay(2000)
        console.log('delete reply', await a.delete())

        await delay(2000)
        const msg = await c.replyFollowup({content: 'replyFollowup'})
        await delay(2000)
        console.log(`delete msg`, await msg.delete())

        await delay(2000)
        const msg2 = await c.replyFollowup({content: '123'})
        await delay(2000)
        const msg2Edit = await msg2.edit({content: '321'})
        await delay(2000)
        console.log('msg2.content', msg2Edit.content)
        console.log('delete msg2', await msg2.delete())

        await c.replyFollowup({
          components: [
            {
              type: ComponentType.ActionRow,
              components: [
                {
                  type: ComponentType.Button,
                  custom_id: JSON.stringify(['deferredReply', 'btn-1']),
                  style: ButtonStyle.Danger,
                  label: 'click me',
                },
              ],
            },
          ],
        })
      })
    },
    messageComponent(c) {
      const [type, btn] = JSON.parse(c.customId)
      if (type === 'deferredReply') {
        return c.deferredReplyUpdate(async (c) => {
          await delay(2000)
          await c.reply({content: `${Math.round(Math.random() * 100)}`})

          await delay(2000)
          const msg = await c.replyFollowup({
            content: `result: ${Math.round(Math.random() * 10000)}`,
          })
          await delay(2000)
          await msg.edit({content: `Math.round: ${Math.round(Math.random() * 10000)}`})
        })
      }
    },
  }),
})
