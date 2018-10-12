/* eslint-env jest */
import RingCentral from '../src/ringcentral'
import dotenv from 'dotenv'

dotenv.config()

jest.setTimeout(64000)

const rc = new RingCentral(process.env.RINGCENTRAL_CLIENT_ID, process.env.RINGCENTRAL_CLIENT_SECRET, process.env.RINGCENTRAL_SERVER_URL)

describe('ringcentral', () => {
  test('glip group', async () => {
    await rc.authorize({
      username: process.env.RINGCENTRAL_USERNAME,
      extension: process.env.RINGCENTRAL_EXTENSION,
      password: process.env.RINGCENTRAL_PASSWORD
    })

    // let r = await rc.get('/restapi/v1.0/glip/groups')

    // let myGroup = r.data.records.filter(g => g.name === 'my-uniq-team-name')[0]
    // console.log(myGroup)

    // try {
    //   r = await rc.post(`restapi/v1.0/glip/groups/${myGroup.id}/bulk-assign`, {
    //     removedPersonIds: [myGroup.members[0]]
    //   })
    //   console.log(r.data)
    // } catch (e) {
    //   console.log(e.response.data)
    // }

    let r = await rc.get('/restapi/v1.0/glip/groups')
    const everyoneGroup = r.data.records.filter(g => g.type === 'Everyone')[0]
    console.log(everyoneGroup.members)

    try {
      r = await rc.post('/restapi/v1.0/glip/groups', {
        type: 'Team',
        isPublic: true,
        name: 'my-uniq-team-name',
        description: 'Group created for testing with the ringcentral-js-concise project',
        members: everyoneGroup.members
      })
      // console.log(r.data)
    } catch (e) {
      console.log(e.response.data)
    }

    await rc.revoke()
  })
})
