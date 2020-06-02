/* eslint-env jest */
import RingCentral from '../src/ringcentral'
import PubNub from '../src/pubnub'
import waitFor from 'wait-for-async'

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

    await waitFor({ interval: 3000 })

    await rc.post('/restapi/v1.0/account/~/extension/~/ring-out', {
      from: { phoneNumber: process.env.RINGCENTRAL_USERNAME },
      to: { phoneNumber: process.env.RINGCENTRAL_RECEIVER },
      playPrompt: true
    })

    await waitFor({ interval: 3000, times: 10, condition: () => count > 0 })

    expect(count).toBeGreaterThan(0)

    await pubnub.revoke()
    await rc.revoke()
  })
})
