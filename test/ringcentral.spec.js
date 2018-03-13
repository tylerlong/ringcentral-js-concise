/* eslint-env jest */
const RingCentral = require('../src/ringcentral')
const dotenv = require('dotenv')

dotenv.config()

jest.setTimeout(64000)

const rc = new RingCentral(process.env.clientId, process.env.clientSecret, process.env.server)

describe('ringcentral', () => {
  test('authorize / refresh / revoke', async () => {
    await rc.authorize({
      username: process.env.username,
      extension: process.env.extension,
      password: process.env.password
    })
    const token = rc.token()
    expect(token).toBeDefined()
    expect(token.access_token).toBeDefined()

    const accessToken = rc.token().access_token
    await rc.refresh()
    expect(rc.token().access_token).not.toBe(accessToken)

    await rc.revoke()
    expect(rc.token()).toBeUndefined()
  })
  test('authorizeUri', () => {
    const authorizeUri = rc.authorizeUri('http://example.com', 'state')
    expect(authorizeUri.indexOf('redirect_uri=')).not.toBe(-1)
  })
  test('constants', () => {
    expect(RingCentral.SANDBOX_SERVER).toBeDefined()
    expect(RingCentral.SANDBOX_SERVER).toBe('https://platform.devtest.ringcentral.com')
    expect(RingCentral.PRODUCTION_SERVER).toBeDefined()
    expect(RingCentral.PRODUCTION_SERVER).toBe('https://platform.ringcentral.com')
  })
  test('http methods', async () => {
    await rc.authorize({
      username: process.env.username,
      extension: process.env.extension,
      password: process.env.password
    })

    // get
    let r = await rc.get('/restapi/v1.0/account/~/extension/~')
    expect(r.data.extensionNumber).toBe('101')

    // post
    r = await rc.post('/restapi/v1.0/account/~/extension/~/sms', {
      to: [{ phoneNumber: process.env.receiver }],
      from: { phoneNumber: process.env.username },
      text: 'Hello world'
    })
    expect(r.data.type).toBe('SMS')

    // put
    const messageUrl = `/restapi/v1.0/account/~/extension/~/message-store/${r.data.id}`
    r = await rc.put(messageUrl, { readStatus: 'Unread' })
    expect(r.data.readStatus).toBe('Unread')
    r = await rc.put(messageUrl, { readStatus: 'Read' })
    expect(r.data.readStatus).toBe('Read')

    // todo: patch

    // delete
    await rc.delete(messageUrl)
    r = await rc.get(messageUrl)
    expect(r.data.availability).toBe('Deleted')
  })
})
