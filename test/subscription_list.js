/* eslint-env jest */
const RingCentral = require('../src/ringcentral')
const dotenv = require('dotenv')

dotenv.config()

jest.setTimeout(256000)

const rc = new RingCentral(process.env.RINGCENTRAL_CLIENT_ID, process.env.RINGCENTRAL_CLIENT_SECRET, process.env.RINGCENTRAL_SERVER_URL)

describe('demo', () => {
  test('hello world', async () => {
    await rc.authorize({
      username: process.env.RINGCENTRAL_USERNAME,
      extension: process.env.RINGCENTRAL_EXTENSION,
      password: process.env.RINGCENTRAL_PASSWORD
    })
    const res = await rc.get('/restapi/v1.0/subscription')
    console.log(JSON.stringify(res.data, null, 2))
  })
})
