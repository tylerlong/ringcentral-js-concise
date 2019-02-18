/* eslint-env jest */
import RingCentral from '../src/ringcentral'

jest.setTimeout(64000)

const rc = new RingCentral(process.env.RINGCENTRAL_CLIENT_ID, process.env.RINGCENTRAL_CLIENT_SECRET, process.env.RINGCENTRAL_SERVER_URL)

describe('ringcentral', () => {
  test('tokenChanged event', async () => {
    let token = null
    let count = 0
    rc.on('tokenChanged', newToken => {
      token = newToken
      count += 1
    })
    rc.token('hello')
    expect(token).toBe('hello')
    expect(count).toBe(1)
  })
})
