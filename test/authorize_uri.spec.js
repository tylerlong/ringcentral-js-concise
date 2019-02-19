/* eslint-env jest */
import RingCentral from '../src/ringcentral'

jest.setTimeout(128000)

const rc = new RingCentral(process.env.RINGCENTRAL_CLIENT_ID, process.env.RINGCENTRAL_CLIENT_SECRET, process.env.RINGCENTRAL_SERVER_URL)

describe('authorze uri', () => {
  test('authorize uri', async () => {
    const r = await rc.get('/restapi/oauth/authorize', { params: {
      response_type: 'code',
      redirect_uri: 'https://ringcentral.github.io/ringcentral-js-widget/page/redirect.html',
      state: 'myState',
      client_id: process.env.RINGCENTRAL_CLIENT_ID
    } })
    expect(r.status).toBe(200)
    expect(r.data).toContain('<!DOCTYPE HTML>') // returned content is an HTML page
  })
})
