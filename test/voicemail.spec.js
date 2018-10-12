/* eslint-env jest */
import RingCentral from '../src/ringcentral'
import dotenv from 'dotenv'

dotenv.config()

jest.setTimeout(64000)

const rc = new RingCentral(process.env.RINGCENTRAL_CLIENT_ID, process.env.RINGCENTRAL_CLIENT_SECRET, process.env.RINGCENTRAL_SERVER_URL)

describe('ringcentral', () => {
  test('voicemail', async () => {
    await rc.authorize({
      username: process.env.RINGCENTRAL_USERNAME,
      extension: process.env.RINGCENTRAL_EXTENSION,
      password: process.env.RINGCENTRAL_PASSWORD
    })

    // fetch call log
    await rc.get('/restapi/v1.0/account/~/extension/~/call-log', { params: {
      type: 'Voice',
      direction: 'Inbound',
      view: 'Detailed'
    } })

    // fetch voice mail
    await rc.get('/restapi/v1.0/account/~/extension/~/message-store', { params: {
      messageType: 'VoiceMail',
      dateFrom: '2017-05-16T05:47:00.000Z'
    } })

    // note: for voicemail,  callLog.message.id === message-store.attachments[0].id

    await rc.revoke()
  })
})
