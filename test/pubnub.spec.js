/* eslint-env jest */
const RingCentral = require('../src/ringcentral')
const PubNub = require('../src/pubnub')
const dotenv = require('dotenv')

dotenv.config()

jest.setTimeout(64000)

const rc = new RingCentral(process.env.clientId, process.env.clientSecret, process.env.server)

function timeout (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

describe('pubnub', () => {
  test('SMS notification', async () => {
    await rc.authorize({
      username: process.env.username,
      extension: process.env.extension,
      password: process.env.password
    })
    let count = 0
    const pubnub = new PubNub(rc, ['/restapi/v1.0/account/~/extension/~/message-store'], message => {
      count += 1
    })
    await pubnub.subscribe()
    await timeout(5000)
    await rc.post('/restapi/v1.0/account/~/extension/~/sms', {
      to: [{ phoneNumber: process.env.receiver }],
      from: { phoneNumber: process.env.username },
      text: 'Hello world'
    })
    await timeout(15000)
    pubnub.revoke()
    expect(count >= 1).toBe(true)
  })

  test('Glip post notification', async () => {
    await rc.authorize({
      username: process.env.username,
      extension: process.env.extension,
      password: process.env.password
    })
    let count = 0
    const pubnub = new PubNub(rc, ['/restapi/v1.0/glip/posts'], message => {
      count += 1
    })
    await pubnub.subscribe()
    await timeout(5000)
    await rc.post(`/restapi/v1.0/glip/groups/${process.env.glipGroupId}/posts`, {
      text: 'Hello world'
    })
    await timeout(15000)
    pubnub.revoke()
    expect(count >= 1).toBe(true)
  })
})
