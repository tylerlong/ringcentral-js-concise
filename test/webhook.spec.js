/* eslint-env jest */
const RingCentral = require('../src/ringcentral')
const dotenv = require('dotenv')

dotenv.config()

jest.setTimeout(256000)

const rc = new RingCentral(process.env.clientId, process.env.clientSecret, process.env.server)

function timeout (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

describe('webhook', () => {
  test('Glip post notification', async () => {
    await rc.authorize({
      username: process.env.username,
      extension: process.env.extension,
      password: process.env.password
    })
    let res
    try {
      res = await rc.post('/restapi/v1.0/subscription', {
        eventFilters: [ '/restapi/v1.0/glip/posts' ],
        deliveryMode: {
          transportType: 'WebHook',
          address: process.env.webhookUri
        }
      })
      console.log(res)
    } catch (e) {
      console.log(e)
      console.log(e.response)
      console.log(e.response.data)
      return
    }
    await timeout(5000)
    await rc.post(`/restapi/v1.0/glip/groups/${process.env.glipGroupId}/posts`, {
      text: 'Hello world'
    })
    await timeout(200000)
    res = await rc.delete(`/restapi/v1.0/subscription/${res.data.id}`)
    console.log(res)
  })
})
