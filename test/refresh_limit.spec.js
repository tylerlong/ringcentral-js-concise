/* eslint-env jest */
const RingCentral = require('../src/ringcentral')
const dotenv = require('dotenv')
const delay = require('timeout-as-promise')

dotenv.config()

jest.setTimeout(3600000)

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
    // await rc.refresh() // uncomment this will cause this test to fail

    rc.token(token) // restore old token
    await rc.refresh() // refresh again

    const r = await rc.post('/restapi/v1.0/account/~/extension/~/sms', {
      to: [{ phoneNumber: process.env.RINGCENTRAL_RECEIVER }],
      from: { phoneNumber: process.env.RINGCENTRAL_USERNAME },
      text: 'Hello world'
    })
    expect(r.status).toBe(200)

    await rc.revoke()
  })
})
