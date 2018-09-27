/* eslint-env jest */
import dotenv from 'dotenv'

import RingCentral from '../src/ringcentral'

let rc

beforeAll(async done => {
  dotenv.config()
  jest.setTimeout(64000)
  rc = new RingCentral(process.env.RINGCENTRAL_CLIENT_ID, process.env.RINGCENTRAL_CLIENT_SECRET, process.env.RINGCENTRAL_SERVER_URL)
  await rc.authorize({
    username: process.env.RINGCENTRAL_USERNAME,
    extension: process.env.RINGCENTRAL_EXTENSION,
    password: process.env.RINGCENTRAL_PASSWORD
  })
  done()
})

afterAll(async done => {
  await rc.revoke()
  done()
})

export { rc }
