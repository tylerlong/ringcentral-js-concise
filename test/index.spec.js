/* eslint-env jest */
const RingCentral = require('../dist/ringcentral')
const dotenv = require('dotenv')

dotenv.config()

describe('ringcentral', () => {
  test('authorize', async () => {
    const rc = new RingCentral(process.env.clientId, process.env.clientSecret, process.env.server)
    const r = await rc.authorize({
      username: process.env.username,
      extension: process.env.extension,
      password: process.env.password
    })
    console.log(r)
  })
})
