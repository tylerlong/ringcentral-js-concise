const axios = require('axios')
const { Base64 } = require('js-base64')
const path = require('path')
const querystring = require('querystring')

class RingCentral {
  constructor (clientId, clientSecret, server) {
    this.clientId = clientId
    this.clientSecret = clientSecret
    this.server = server
  }

  async authorize ({ username, extension, password }) {
    const r = await axios({
      method: 'post',
      url: path.join(this.server, '/restapi/oauth/token'),
      data: querystring.stringify({ grant_type: 'password', username, extension, password }),
      headers: { Authorization: `Basic ${Base64.encode(`${this.clientId}:${this.clientSecret}`)}` }
    })
    return r
  }
}

module.exports = RingCentral
