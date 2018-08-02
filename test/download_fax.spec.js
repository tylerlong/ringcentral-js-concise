/* eslint-env jest */
import RingCentral from '../src/ringcentral'
import dotenv from 'dotenv'

dotenv.config()

jest.setTimeout(64000)

const rc = new RingCentral(process.env.RINGCENTRAL_CLIENT_ID, process.env.RINGCENTRAL_CLIENT_SECRET, process.env.RINGCENTRAL_SERVER_URL)

describe('ringcentral', () => {
  test('download fax', async () => {
    await rc.authorize({
      username: process.env.RINGCENTRAL_USERNAME,
      extension: process.env.RINGCENTRAL_EXTENSION,
      password: process.env.RINGCENTRAL_PASSWORD
    })

    let r = await rc.get('/restapi/v1.0/account/~/extension/~/message-store')
    expect(r.status).toBe(200)
    const faxes = r.data.records.filter(m => m.type === 'Fax')
    const lastFax = faxes[faxes.length - 1]

    try {
      r = await rc.get(`/restapi/v1.0/account/~/extension/~/message-store/${lastFax.id}/content/${lastFax.attachments[0].id}`)
      expect(r.status).toBe(200)
    } catch (e) {
      console.log(e.response.data)
      expect(false).toBe(true) // make this test fail upon exception
    }

    await rc.revoke()
  })
})
