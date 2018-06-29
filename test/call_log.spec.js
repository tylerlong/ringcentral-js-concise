/* eslint-env jest */
const RingCentral = require('../src/ringcentral')
const dotenv = require('dotenv')

dotenv.config()

jest.setTimeout(64000)

const rc = new RingCentral(process.env.RINGCENTRAL_CLIENT_ID, process.env.RINGCENTRAL_CLIENT_SECRET, process.env.RINGCENTRAL_SERVER_URL)

describe('ringcentral', () => {
  test('call logs', async () => {
    await rc.authorize({
      username: process.env.RINGCENTRAL_USERNAME,
      extension: process.env.RINGCENTRAL_EXTENSION,
      password: process.env.RINGCENTRAL_PASSWORD
    })

    let r = await rc.get('/restapi/v1.0/account/~/extension/~/call-log')
    expect(r.status).toBe(200)
    // console.log(JSON.stringify(r.data.records.filter(cl => 'message' in cl)[0], null, 2))

    await rc.revoke()
  })
})
