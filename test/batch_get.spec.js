/* eslint-env jest */
const RingCentral = require('../src/ringcentral')
const dotenv = require('dotenv')
const { maxBy, reduce } = require('ramda')
const multipartMixedParser = require('multipart-mixed-parser')

dotenv.config()

jest.setTimeout(64000)

const rc = new RingCentral(process.env.RINGCENTRAL_CLIENT_ID, process.env.RINGCENTRAL_CLIENT_SECRET, process.env.RINGCENTRAL_SERVER_URL)

describe('ringcentral', () => {
  test('batch get', async () => {
    await rc.authorize({
      username: process.env.RINGCENTRAL_USERNAME,
      extension: process.env.RINGCENTRAL_EXTENSION,
      password: process.env.RINGCENTRAL_PASSWORD
    })

    let r = await rc.get('/restapi/v1.0/glip/groups')
    const group = reduce(maxBy(g => g.members.length), { members: [] }, r.data.records)
    // console.log(group)

    r = await rc.get(`/restapi/v1.0/glip/persons/${group.members.join(',')}`)
    const data = multipartMixedParser.parse(r.data)
    const persons = data.splice(1) // first element in data is response status
    expect(persons.length > 0).toBe(true)
    // console.log(JSON.stringify(persons, null, 2))

    await rc.revoke()
  })
})
