/* eslint-env jest */
import RingCentral from '../src/ringcentral'
import FormData from 'form-data'
import fs from 'fs'
import path from 'path'
import delay from 'timeout-as-promise'

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
    formData.append('files[]', JSON.stringify({ to: [{ phoneNumber: process.env.RINGCENTRAL_RECEIVER }] }), 'test.json')
    formData.append('files[]', 'Hello world', 'test.txt')
    formData.append('files[]', fs.createReadStream(path.join(__dirname, 'test.png')), 'test.png')
    const r = await rc.post('/restapi/v1.0/account/~/extension/~/fax', formData, {
      headers: formData.getHeaders()
    })
    expect(r.status).toBe(200)

    await delay(1000)
    await rc.revoke()
  })
})
