/* eslint-env jest */
const RingCentral = require('../src/ringcentral')
const dotenv = require('dotenv')

dotenv.config()

jest.setTimeout(256000)

const rc = new RingCentral(process.env.RINGCENTRAL_CLIENT_ID, process.env.RINGCENTRAL_CLIENT_SECRET, process.env.RINGCENTRAL_SERVER_URL)

function timeout (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

describe('webhook', () => {
  test('Glip post notification', async () => {
    await rc.authorize({
      username: process.env.RINGCENTRAL_USERNAME,
      extension: process.env.RINGCENTRAL_EXTENSION,
      password: process.env.RINGCENTRAL_PASSWORD
    })
    let subId
    try {
      const res = await rc.post('/restapi/v1.0/subscription', {
        eventFilters: [
          '/restapi/v1.0/glip/posts',
          '/restapi/v1.0/account/~/extension/~/message-store'
          // '/restapi/v1.0/account/~/extension/~/message-store/instant?type=SMS'
        ],
        deliveryMode: {
          transportType: 'WebHook',
          address: process.env.RINGCENTRAL_WEBHOOK_URI
        }
      })
      subId = res.data.id
    } catch (e) {
      console.error(e.response.data)
      return
    }
    await timeout(5000)
    await rc.post(`/restapi/v1.0/glip/groups/${process.env.RINGCENTRAL_GLIP_GROUP_ID}/posts`, {
      text: 'Hello world'
    })
    await timeout(200000)
    await rc.delete(`/restapi/v1.0/subscription/${subId}`)
  })
})
