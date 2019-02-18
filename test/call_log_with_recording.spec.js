/* eslint-env jest */
import RingCentral from '../src/ringcentral'

jest.setTimeout(64000)

const rc = new RingCentral(process.env.RINGCENTRAL_CLIENT_ID, process.env.RINGCENTRAL_CLIENT_SECRET, process.env.RINGCENTRAL_SERVER_URL)

describe('ringcentral', () => {
  test('call logs with recording', async () => {
    await rc.authorize({
      username: process.env.RINGCENTRAL_USERNAME,
      extension: process.env.RINGCENTRAL_EXTENSION,
      password: process.env.RINGCENTRAL_PASSWORD
    })

    await rc.get('/restapi/v1.0/account/~/extension/~/call-log', { params: {
      withRecording: true,
      dateFrom: '2016-03-10T18:07:52.534Z',
      perPage: 3,
      view: 'Detailed',
      type: 'Voice'
    } })
    // console.log(r.data)
    // console.log(r)
    await rc.revoke()
  })
})
