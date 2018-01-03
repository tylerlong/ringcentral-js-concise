const axios = require('axios')
const { Base64 } = require('js-base64')
const path = require('path')
const querystring = require('querystring')

class RingCentral {
  constructor (clientId, clientSecret, server) {
    this.clientId = clientId
    this.clientSecret = clientSecret
    this.server = server
    this._token = undefined
    this._timeout = undefined
    this.autoRefresh = true
  }

  token (_token) {
    if (_token === undefined) { // get
      return this._token
    }
    this._token = _token
    if (this._timeout) {
      clearTimeout(this._timeout)
      this._timeout = null
    }
    if (this.autoRefresh && _token) {
      this._timeout = setTimeout(() => {
        this.refresh()
      }, _token.expires_in - 120000)
    }
  }

  async authorize ({ username, extension, password }) {
    const r = await axios({
      method: 'post',
      url: path.join(this.server, '/restapi/oauth/token'),
      data: querystring.stringify({ grant_type: 'password', username, extension, password }),
      headers: this._basicAuthorizationHeader()
    })
    this.token(r.data)
  }

  async refresh () {
    if (this._token === undefined) {
      return
    }
    const r = await axios({
      method: 'post',
      url: path.join(this.server, '/restapi/oauth/token'),
      data: querystring.stringify({ grant_type: 'refresh_token', refresh_token: this._token.refresh_token }),
      headers: this._basicAuthorizationHeader()
    })
    this.token(r.data)
  }

  _basicAuthorizationHeader () {
    return { Authorization: `Basic ${Base64.encode(`${this.clientId}:${this.clientSecret}`)}` }
  }

  _bearerAuthorizationHeader () {
    return { Authorization: `Basic ${this._token.access_token}` }
  }
}

module.exports = RingCentral
