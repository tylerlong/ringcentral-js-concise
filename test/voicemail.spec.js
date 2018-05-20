/* eslint-env jest */
const RingCentral = require('../src/ringcentral')
const dotenv = require('dotenv')

dotenv.config()

jest.setTimeout(64000)

const rc = new RingCentral(process.env.RINGCENTRAL_CLIENT_ID, process.env.RINGCENTRAL_CLIENT_SECRET, process.env.RINGCENTRAL_SERVER_URL)

describe('ringcentral', () => {
  test('authorize / refresh / revoke', async () => {
    await rc.authorize({
      username: process.env.RINGCENTRAL_USERNAME,
      extension: process.env.RINGCENTRAL_EXTENSION,
      password: process.env.RINGCENTRAL_PASSWORD
    })

    // fetch call log
    let r = await rc.get('/restapi/v1.0/account/~/extension/~/call-log', {
      type: 'Voice',
      direction: 'Inbound',
      view: 'Detailed'
    })
    console.log(JSON.stringify(r.data.records[0], null, 2))

    // fetch voice mail
    r = await rc.get('/restapi/v1.0/account/~/extension/~/message-store', {
      messageType: 'VoiceMail',
      dateFrom: '2017-05-16T05:47:00.000Z'
    })
    console.log(JSON.stringify(r.data.records[0], null, 2))

    // note: for voicemail,  callLog.message.id === message-store.attachments[0].id

    await rc.revoke()
  })
})
