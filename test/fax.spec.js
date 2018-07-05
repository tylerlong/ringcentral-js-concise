/* eslint-env jest */
import RingCentral from '../src/ringcentral'
import dotenv from 'dotenv'
import FormData from 'form-data'
import fs from 'fs'
import path from 'path'
import concat from 'concat-stream'
import delay from 'timeout-as-promise'

dotenv.config()

jest.setTimeout(64000)

const rc = new RingCentral(process.env.RINGCENTRAL_CLIENT_ID, process.env.RINGCENTRAL_CLIENT_SECRET, process.env.RINGCENTRAL_SERVER_URL)

describe('ringcentral', () => {
  test('fax', async () => {
    await rc.authorize({
      username: process.env.RINGCENTRAL_USERNAME,
      extension: process.env.RINGCENTRAL_EXTENSION,
      password: process.env.RINGCENTRAL_PASSWORD
    })

    const formData = new FormData()
    formData.append('json', JSON.stringify({ to: [{ phoneNumber: process.env.RINGCENTRAL_RECEIVER }] }), 'test.json')
    formData.append('attachment', fs.createReadStream(path.join(__dirname, 'test.png')), 'test.png')
    formData.pipe(concat({ encoding: 'buffer' }, async data => {
      const r = await rc.post('/restapi/v1.0/account/~/extension/~/fax', data, {
        headers: formData.getHeaders()
      })
      expect(r.status).toBe(200)
    }))

    await delay(10000)
    await rc.revoke()
  })
})
