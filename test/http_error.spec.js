/* eslint-env jest */
import RingCentral from '../src/ringcentral'

jest.setTimeout(64000)

const rc = new RingCentral(process.env.RINGCENTRAL_CLIENT_ID, process.env.RINGCENTRAL_CLIENT_SECRET, process.env.RINGCENTRAL_SERVER_URL)

describe('HTTPError', () => {
  test('default', async () => {
    expect(rc.get('/restapi/v1.0/account/~/extension/~')).rejects.toThrow()
    try {
      await rc.get('/restapi/v1.0/account/~/extension/~')
    } catch (e) {
      expect(e.status).toBe(401)
      expect(e.statusText).toBe('Unauthorized')
    }
  })
})
