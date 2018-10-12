/* eslint-env jest */
import RingCentral from '../src/ringcentral'
// import PubNub from '../src/pubnub'
import dotenv from 'dotenv'
// import delay from 'timeout-as-promise'

dotenv.config()

jest.setTimeout(128000)

const rc = new RingCentral(process.env.RINGCENTRAL_CLIENT_ID, process.env.RINGCENTRAL_CLIENT_SECRET, process.env.RINGCENTRAL_SERVER_URL)

describe('answering rule', () => {
  test('default', async () => {
    await rc.authorize({
      username: process.env.RINGCENTRAL_USERNAME,
      extension: process.env.RINGCENTRAL_EXTENSION,
      password: process.env.RINGCENTRAL_PASSWORD
    })

    // let r =
    await rc.get('/restapi/v1.0/account/~/extension/~/answering-rule/business-hours-rule')
    // console.log(r.data)

    // try {
    //   r = await rc.put('/restapi/v1.0/account/~/extension/~/answering-rule/business-hours-rule', {
    //     queue: r.data.queue
    //   })
    //   console.log(r.data)
    // } catch (e) {
    //   console.log(e.response.data)
    // }

    await rc.revoke()
  })
})
