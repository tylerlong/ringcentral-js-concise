/* eslint-env jest */
import RingCentral from '../src/ringcentral'
import PubNub from '../src/pubnub'
import dotenv from 'dotenv'
import delay from 'timeout-as-promise'

dotenv.config()

jest.setTimeout(128000)

const rc = new RingCentral(process.env.RINGCENTRAL_CLIENT_ID, process.env.RINGCENTRAL_CLIENT_SECRET, process.env.RINGCENTRAL_SERVER_URL)

describe('ringcentral', () => {
  test('call control', async () => {
    await rc.authorize({
      username: process.env.RINGCENTRAL_USERNAME,
      extension: process.env.RINGCENTRAL_EXTENSION,
      password: process.env.RINGCENTRAL_PASSWORD
    })

    let count = 0
    const pubnub = new PubNub(rc, [
      '/restapi/v1.0/account/~/extension/~/presence?detailedTelephonyState=true'
    ], message => {
      count += 1
    })
    await pubnub.subscribe()

    await delay(3000)

    await rc.post('/restapi/v1.0/account/~/extension/~/ring-out', {
      from: { phoneNumber: process.env.RINGCENTRAL_USERNAME },
      to: { phoneNumber: process.env.RINGCENTRAL_RECEIVER },
      playPrompt: true
    })

    await delay(20000)

    expect(count).toBeGreaterThan(0)

    await pubnub.revoke()
    await rc.revoke()
  })
})
