import {defineCommand} from '../src/builder.ts'

const test1 = defineCommand({
  name: 'test1',
  description: 'test1',
}).createHandler({
  test1: (c) => {
    return c.reply({content: 'ok'})
  },
})

const test2 = defineCommand({
  name: 'test2',
  description: 'test2',
}).createHandler({
  test2: (c) => {
    return c.reply({content: ""})
  }
})


export const commands = [test1, test2]
