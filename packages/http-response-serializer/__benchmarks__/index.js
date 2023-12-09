import { Bench } from 'tinybench'
import middy from '../../core/index.js'
import middleware from '../index.js'

const bench = new Bench({ time: 1_000 })

const context = {
  getRemainingTimeInMillis: () => 30000
}
const setupHandler = () => {
  const baseHandler = () => ({
    body: JSON.stringify({
      foo: 'bar',
      bar: 'foo'
    })
  })
  return middy(baseHandler).use(
    middleware({
      serializers: [
        {
          regex: /^application\/xml$/,
          serializer: ({ body }) => `<message>${body}</message>`
        },
        {
          regex: /^application\/json$/,
          serializer: ({ body }) => JSON.stringify(body)
        },
        {
          regex: /^text\/plain$/,
          serializer: ({ body }) => body
        }
      ],
      default: 'application/json'
    })
  )
}

const warmHandler = setupHandler()

await bench
  .add('Serialize Response', async (event = {}) => {
    try {
      await warmHandler(event, context)
    } catch (e) {}
  })

  .run()

console.table(bench.table())
