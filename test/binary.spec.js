/* eslint-env jest */
import fs from 'fs'

import { rc } from './setup'

describe('binary', () => {
  test('default', async () => {
    const date = new Date()
    date.setDate(date.getDate() - 30)
    let r = await rc.get('/restapi/v1.0/account/~/extension/~/message-store', {
      params: {
        dateFrom: date.toISOString()
      }
    })
    const faxes = r.data.records.filter(m => m.type === 'Fax' && m.faxPageCount > 1)
    const fax = faxes[0]
    r = await rc.get(`/restapi/v1.0/account/~/extension/~/message-store/${fax.id}/content/${fax.attachments[0].id}`, {
      responseType: 'arraybuffer'
    })
    fs.writeFileSync('test.pdf', Buffer.from(r.data, 'binary'))
  })
})
