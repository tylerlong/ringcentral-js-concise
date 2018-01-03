/* eslint-env jest */
const RingCentral = require('../dist/ringcentral')
const dotenv = require('dotenv')

dotenv.config()

describe('ringcentral', () => {
  test('authorize', async () => {
    const rc = new RingCentral(process.env.clientId, process.env.clientSecret, process.env.server)
    await rc.authorize({
      username: process.env.username,
      extension: process.env.extension,
      password: process.env.password
    })
    const token = rc.token()
    expect(token).toBeDefined()
    expect(token.access_token).toBeDefined()
  })
})
