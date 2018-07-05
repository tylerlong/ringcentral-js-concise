/* eslint-env jest */
import RingCentral from '../src/ringcentral'
import dotenv from 'dotenv'

dotenv.config()

jest.setTimeout(64000)

const rc = new RingCentral(process.env.RINGCENTRAL_CLIENT_ID, process.env.RINGCENTRAL_CLIENT_SECRET, process.env.RINGCENTRAL_SERVER_URL)

describe('ringcentral', () => {
  test('sms', async () => {
    await rc.authorize({
      username: process.env.RINGCENTRAL_USERNAME,
      extension: process.env.RINGCENTRAL_EXTENSION,
      password: process.env.RINGCENTRAL_PASSWORD
    })

    const token = rc.token() // save the token
    await rc.refresh()
    rc.token(token) // restore the old token

    try {
      await rc.post('/restapi/v1.0/account/~/extension/~/sms', {
        to: [{ phoneNumber: process.env.RINGCENTRAL_RECEIVER }],
        from: { phoneNumber: process.env.RINGCENTRAL_USERNAME },
        text: 'Hello world'
      })
    } catch (e) {
      expect(e.response.status).toBe(401)
    }

    await rc.refresh() // refresh again with old refresh token

    const r2 = await rc.post('/restapi/v1.0/account/~/extension/~/sms', {
      to: [{ phoneNumber: process.env.RINGCENTRAL_RECEIVER }],
      from: { phoneNumber: process.env.RINGCENTRAL_USERNAME },
      text: 'Hello world'
    })
    expect(r2.status).toBe(200)

    await rc.revoke()
  })
})
