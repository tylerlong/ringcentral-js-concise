/* eslint-env jest */
import RingCentral from '../src/ringcentral'

jest.setTimeout(64000)

const rc = new RingCentral(process.env.RINGCENTRAL_CLIENT_ID, process.env.RINGCENTRAL_CLIENT_SECRET, process.env.RINGCENTRAL_SERVER_URL)

describe('token issue', () => {
  test('default', async () => {
    rc.token({ id: '2125741008', token: { access_token: 'U0pDMDFQMDNQQVMwMHxBQUNpc2lHeDNQb2t3bWtvT3ZsUkstSnNiVEpPRXlTSFhFbHNlU2pjWF9fNW9sbklkYkxKZjRsS1JNazZoTEZpaWN0MXpQTnNvdzNkVGllTDFsQV9wXzNXbk5DVUtEVjNFUVp6ckZBY0tjME1hakRsVUp3TGQ0a3V3Tm1tdVloaUtEYWJJZVpKR0lTd0tUeHpuR09JZ2l3a3BWWTYxQ1hIckctUEtKc3JpM0I4OVBtb1p4MUsxYTR6aFhmUmVOSjI2eW5jTzgxUlJqNV9QNGNXSUI5ODhaYk18dGVTd0JnfGVlSW1WQ18xa2FUU3JGckgtTF9pR0F8QUE', token_type: 'bearer', expires_in: 3600, refresh_token: 'U0pDMDFQMDNQQVMwMHxBQUNpc2lHeDNQb2t3bWtvT3ZsUkstSnNiVEpPRXlTSFhFbHNlU2pjWF9fNW9sbklkYkxKZjRsS1JNazZoTEZpaWN0MXpQTnNvdzNkVGllTDFsQV9wXzNXTDdsQ0YzVHRqV0dWM01wcVBDVnZucFN0YjB0M3lHVzR3Tm1tdVloaUtEYWJJZVpKR0lTd0tUeHpuR09JZ2l3a3BWWTYxQ1hIckctUEtKc3JpM0I4OVBtb1p4MUsxYTR6aFhmUmVOSjI2eW5jTzgxUlJqNV9QMWlySmhXZHY4bC18dGVTd0JnfEg2NlUxc09jdjczUS14b29nMk1rNHd8QUE', refresh_token_expires_in: 604800, scope: 'EditReportingSettings EditMeetingsPresence Meetings EditLiveReports Voicemail VoipCalling ReadClientInfo SubscriptionAPNS Glip Interoperability DirectRingOut ReadContacts ReadAccounts SubscriptionGCM SubscriptionWebhook EditPaymentInfo EditPresence SendNotifications EditAccounts ReadMessages Faxes ReadPresence EditCallLog ReadCallRecording EditCustomData ReadLiveReports Contacts EditExtensions RoleManagement TelephonySessions RingOut NumberLookup SMS InternalMessages ReadCallLog Accounts EditMessages', owner_id: '2125741008', endpoint_id: 'TlNzMYc9RqOIO6mJkNT4BQ' } })

    try {
      await rc.get('/restapi/v1.0/account/~/extension/~')
    } catch (e) {
      expect(e.config.data).toEqual('grant_type=refresh_token&refresh_token=')
    }
  })
})
