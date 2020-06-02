/* eslint-env jest */
import RingCentral from '../src/ringcentral'

jest.setTimeout(128000)

const rc = new RingCentral(process.env.RINGCENTRAL_CLIENT_ID, process.env.RINGCENTRAL_CLIENT_SECRET, process.env.RINGCENTRAL_SERVER_URL)

describe('answering rule', () => {
  test('default', async () => {
    await rc.authorize({
      username: process.env.RINGCENTRAL_USERNAME,
      extension: process.env.RINGCENTRAL_EXTENSION,
      password: process.env.RINGCENTRAL_PASSWORD
    })

    await rc.get('/restapi/v1.0/account/~/extension/~/answering-rule/business-hours-rule')

    await rc.revoke()
  })
})
