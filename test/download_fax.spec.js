/* eslint-env jest */
import RingCentral from '../src/ringcentral'
import dotenv from 'dotenv'

dotenv.config()

jest.setTimeout(256000)

const rc = new RingCentral(process.env.RINGCENTRAL_CLIENT_ID, process.env.RINGCENTRAL_CLIENT_SECRET, process.env.RINGCENTRAL_SERVER_URL)

describe('ringcentral', () => {
  test('download fax', async () => {
    await rc.authorize({
      username: process.env.RINGCENTRAL_USERNAME,
      extension: process.env.RINGCENTRAL_EXTENSION,
      password: process.env.RINGCENTRAL_PASSWORD
    })

    let r = await rc.get('/restapi/v1.0/account/~/extension/~/message-store', {
      params: {
        dateFrom: '2015-03-10T18:07:52.534Z',
        direction: 'Outbound',
        messageType: 'Fax'
      }
    })
    expect(r.status).toBe(200)

    for (const fax of r.data.records) {
      try {
        r = await rc.get(fax.attachments[0].uri)
        expect(r.status).toBe(200)
      } catch (e) {
        console.log('fail', fax.id)
        console.log(JSON.stringify(fax, null, 2))
        console.log(JSON.stringify(e.response, null, 2))
        expect(false).toBe(true) // make this test fail upon exception
      }
      break // for loop is for debugging only.
    }
    await rc.revoke()
  })
})
