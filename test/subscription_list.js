/* eslint-env jest */
import RingCentral from '../src/ringcentral'

jest.setTimeout(256000)

const rc = new RingCentral(process.env.RINGCENTRAL_CLIENT_ID, process.env.RINGCENTRAL_CLIENT_SECRET, process.env.RINGCENTRAL_SERVER_URL)

describe('demo', () => {
  test('hello world', async () => {
    await rc.authorize({
      username: process.env.RINGCENTRAL_USERNAME,
      extension: process.env.RINGCENTRAL_EXTENSION,
      password: process.env.RINGCENTRAL_PASSWORD
    })
    const r = await rc.get('/restapi/v1.0/subscription')
    expect(r.status).toBe(200)
    // console.log(JSON.stringify(r.data, null, 2))
  })
})
