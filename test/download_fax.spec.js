/* eslint-env jest */
import dotenv from 'dotenv'
import fs from 'fs'

import RingCentral from '../src/ringcentral'

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

    const fax = r.data.records[r.data.records.length - 1]
    r = await rc.get(fax.attachments[0].uri)
    expect(r.status).toBe(200)
    fs.writeFileSync('test.pdf', Buffer.from(r.data, 'binary'))
    fs.unlinkSync('test.pdf')
    await rc.revoke()
  })
})
