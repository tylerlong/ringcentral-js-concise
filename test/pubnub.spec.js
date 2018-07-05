/* eslint-env jest */
import RingCentral from '../src/ringcentral'
import PubNub from '../src/pubnub'
import dotenv from 'dotenv'

dotenv.config()

jest.setTimeout(128000)

const rc = new RingCentral(process.env.RINGCENTRAL_CLIENT_ID, process.env.RINGCENTRAL_CLIENT_SECRET, process.env.RINGCENTRAL_SERVER_URL)

function timeout (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

describe('pubnub', () => {
  test('SMS notification', async () => {
    await rc.authorize({
      username: process.env.RINGCENTRAL_USERNAME,
      extension: process.env.RINGCENTRAL_EXTENSION,
      password: process.env.RINGCENTRAL_PASSWORD
    })
    let count = 0
    const pubnub = new PubNub(rc, ['/restapi/v1.0/account/~/extension/~/message-store'], message => {
      count += 1
    })
    await pubnub.subscribe()
    await timeout(5000)
    await rc.post('/restapi/v1.0/account/~/extension/~/sms', {
      to: [{ phoneNumber: process.env.RINGCENTRAL_RECEIVER }],
      from: { phoneNumber: process.env.RINGCENTRAL_USERNAME },
      text: 'Hello world'
    })
    await timeout(15000)
    pubnub.revoke()
    expect(count >= 1).toBe(true)
  })

  test('Glip post notification', async () => {
    await rc.authorize({
      username: process.env.RINGCENTRAL_USERNAME,
      extension: process.env.RINGCENTRAL_EXTENSION,
      password: process.env.RINGCENTRAL_PASSWORD
    })
    let count = 0
    const pubnub = new PubNub(rc, ['/restapi/v1.0/glip/posts'], message => {
      count += 1
    })
    await pubnub.subscribe()
    await timeout(5000)
    await rc.post(`/restapi/v1.0/glip/groups/${process.env.RINGCENTRAL_GLIP_GROUP_ID}/posts`, {
      text: 'Hello world'
    })
    await timeout(30000)
    pubnub.revoke()
    expect(count >= 1).toBe(true)
  })
})
