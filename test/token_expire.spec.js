/* eslint-env jest */
import delay from 'timeout-as-promise'
import RingCentral from '../src/ringcentral'
import dotenv from 'dotenv'

dotenv.config()

jest.setTimeout(64000)

const rc = new RingCentral(process.env.RINGCENTRAL_CLIENT_ID, process.env.RINGCENTRAL_CLIENT_SECRET, process.env.RINGCENTRAL_SERVER_URL)

describe('token expire', () => {
  test('default', async () => {
    await rc.authorize({
      username: process.env.RINGCENTRAL_USERNAME,
      extension: process.env.RINGCENTRAL_EXTENSION,
      password: process.env.RINGCENTRAL_PASSWORD
    }, {
      access_token_ttl: 600,
      refresh_token_ttl: 10
    })
    await delay(10000)
    try {
      await rc.refresh()
    } catch (e) { // refresh token expired
      expect(e.status).toBe(400)
      expect(e.data.error_description).toBe('Token expired')
    } finally {
      await rc.revoke()
    }
  })
})
