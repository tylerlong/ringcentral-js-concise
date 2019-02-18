/* eslint-env jest */
import RingCentral from '../src/ringcentral'

jest.setTimeout(64000)

const rc = new RingCentral(process.env.RINGCENTRAL_CLIENT_ID, process.env.RINGCENTRAL_CLIENT_SECRET, process.env.RINGCENTRAL_SERVER_URL)

describe('ringcentral', () => {
  test('permission', async () => {
    await rc.authorize({
      username: process.env.RINGCENTRAL_USERNAME,
      extension: process.env.RINGCENTRAL_EXTENSION,
      password: process.env.RINGCENTRAL_PASSWORD
    })

    // const r =
    await rc.get('/restapi/v1.0/dictionary/permission/ReadPresenceSettings')
    // console.log(r.data)
    await rc.revoke()
  })
})
