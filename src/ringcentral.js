const axios = require('axios')

class RingCentral {
  constructor (clientId, clientSecret, server) {
    this.clientId = clientId
    this.clientSecret = clientSecret
    const userAgent = 'tylerlong/ringcentral-js-concise'
    this.rc = axios.create({
      baseURL: server,
      headers: {
        'RC-User-Agent': userAgent,
        'User-Agent': userAgent
      }
    })
  }

  async authorize ({ username, extension, password }) {
    const r = await this.rc.post('/restapi/oauth/token', { grant_type: 'password', username, extension, password })
    return r
  }
}

module.exports = RingCentral
