/* eslint-env jest */
import RingCentral from '../src/ringcentral'
import PubNub from '../src/pubnub'
import dotenv from 'dotenv'
import delay from 'timeout-as-promise'

dotenv.config()

jest.setTimeout(1280000)

const rc = new RingCentral(process.env.RINGCENTRAL_CLIENT_ID, process.env.RINGCENTRAL_CLIENT_SECRET, process.env.RINGCENTRAL_SERVER_URL)

describe('ringcentral', () => {
  test('call control', async () => {
    await rc.authorize({
      username: process.env.RINGCENTRAL_USERNAME,
      extension: process.env.RINGCENTRAL_EXTENSION,
      password: process.env.RINGCENTRAL_PASSWORD
    })

    const pubnub = new PubNub(rc, [
      '/restapi/v1.0/account/~/extension/~/telephony/sessions',
      '/restapi/v1.0/account/~/extension/~/message-store'
    ], message => {
      console.log(message)
    })
    await pubnub.subscribe()
    console.log(pubnub.subscription())

    await delay(3000)

    await rc.post('/restapi/v1.0/account/~/extension/~/sms', {
      to: [{ phoneNumber: process.env.RINGCENTRAL_RECEIVER }],
      from: { phoneNumber: process.env.RINGCENTRAL_USERNAME },
      text: 'Hello world'
    })

    await delay(1000000)

    await rc.revoke()
  })
})
