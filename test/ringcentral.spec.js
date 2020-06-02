/* eslint-env jest */
import waitFor from 'wait-for-async'

import RingCentral from '../src/ringcentral'

jest.setTimeout(64000)

const rc = new RingCentral(process.env.RINGCENTRAL_CLIENT_ID, process.env.RINGCENTRAL_CLIENT_SECRET, process.env.RINGCENTRAL_SERVER_URL)

describe('ringcentral', () => {
  test('authorize / refresh / revoke', async () => {
    await rc.authorize({
      username: process.env.RINGCENTRAL_USERNAME,
      extension: process.env.RINGCENTRAL_EXTENSION,
      password: process.env.RINGCENTRAL_PASSWORD
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
    let authorizeUri = rc.authorizeUri('http://example.com/oauth.html', {
      responseType: 'code',
      state: 'auth-code-flow',
      brandId: '',
      display: '',
      prompt: ''
    })
    expect(authorizeUri.indexOf('redirect_uri=')).not.toBe(-1)
    expect(authorizeUri.indexOf('response_type=code')).not.toBe(-1)
    expect(authorizeUri.indexOf('state=auth-code-flow')).not.toBe(-1)

    authorizeUri = rc.authorizeUri('http://example.com/oauth.html', {
      state: 'auth-code-flow',
      brandId: '',
      display: '',
      prompt: 'none'
    })
    expect(authorizeUri.indexOf('redirect_uri=')).not.toBe(-1)
    expect(authorizeUri.indexOf('response_type=code')).not.toBe(-1)
    expect(authorizeUri.indexOf('state=auth-code-flow')).not.toBe(-1)
    expect(authorizeUri.indexOf('prompt=none')).not.toBe(-1)

    authorizeUri = rc.authorizeUri('http://example.com/oauth.html', {
      responseType: 'token',
      state: 'implicit-flow',
      brandId: '',
      display: '',
      prompt: ''
    })
    expect(authorizeUri.indexOf('redirect_uri=')).not.toBe(-1)
    expect(authorizeUri.indexOf('response_type=token')).not.toBe(-1)
    expect(authorizeUri.indexOf('state=implicit-flow')).not.toBe(-1)
  })
  test('constants', () => {
    expect(RingCentral.SANDBOX_SERVER).toBeDefined()
    expect(RingCentral.SANDBOX_SERVER).toBe('https://platform.devtest.ringcentral.com')
    expect(RingCentral.PRODUCTION_SERVER).toBeDefined()
    expect(RingCentral.PRODUCTION_SERVER).toBe('https://platform.ringcentral.com')
  })
  test('http methods', async () => {
    await rc.authorize({
      username: process.env.RINGCENTRAL_USERNAME,
      extension: process.env.RINGCENTRAL_EXTENSION,
      password: process.env.RINGCENTRAL_PASSWORD
    })

    // get
    let r = await rc.get('/restapi/v1.0/account/~/extension/~')
    expect(parseInt(r.data.extensionNumber) > 100).toBe(true)

    // post
    r = await rc.post('/restapi/v1.0/account/~/extension/~/sms', {
      to: [{ phoneNumber: process.env.RINGCENTRAL_RECEIVER }],
      from: { phoneNumber: process.env.RINGCENTRAL_USERNAME },
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
    await waitFor({ interval: 3000 })
    r = await rc.get(messageUrl)
    expect(r.data.availability).toBe('Deleted')
  })
})
