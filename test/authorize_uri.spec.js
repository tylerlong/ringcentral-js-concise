/* eslint-env jest */
import RingCentral from '../src/ringcentral'
import dotenv from 'dotenv'
import querystring from 'querystring'
import URI from 'urijs'

dotenv.config()

jest.setTimeout(128000)

const rc = new RingCentral(process.env.RINGCENTRAL_CLIENT_ID, process.env.RINGCENTRAL_CLIENT_SECRET, process.env.RINGCENTRAL_SERVER_URL)

describe('authorze uri', () => {
  test('authorize uri', async () => {
    const data = querystring.stringify({
      response_type: 'code',
      redirect_uri: 'https://ringcentral.github.io/ringcentral-js-widget/page/redirect.html',
      state: 'myState',
      client_id: process.env.RINGCENTRAL_CLIENT_ID
    })

    const r = await rc._axios.request({
      method: 'post',
      url: URI(rc.server).path('/restapi/oauth/authorize').toString(),
      data,
      headers: rc._basicAuthorizationHeader()
    })
    expect(r.status).toBe(200)
    expect(r.data).toContain('<!DOCTYPE HTML>')

    await rc.revoke()
  })
})
