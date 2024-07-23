import {defineCommand, Format} from '../mod.ts'

export const hello = defineCommand({
  name: 'hello',
  description: 'says hi',
}).createHandler({
  hello() {
    return {
      command: (c) => {
        return c.reply({
          content: `Hello ${Format.user(c.user.id)}`,
        })
      },
    }
  },
})
