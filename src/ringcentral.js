const axios = require('axios')
const { Base64 } = require('js-base64')
const querystring = require('querystring')
const URI = require('urijs')

class RingCentral {
  constructor (clientId, clientSecret, server) {
    this.clientId = clientId
    this.clientSecret = clientSecret
    this.server = server
    this._token = undefined
    this._timeout = undefined
    this.autoRefresh = false
  }

  token (_token) {
    if (arguments.length === 0) { // get
      return this._token
    }
    this._token = _token
    if (this._timeout) {
      clearTimeout(this._timeout)
      this._timeout = undefined
    }
    if (this.autoRefresh && _token) {
      this._timeout = setTimeout(() => {
        this.refresh()
      }, (_token.expires_in - 120) * 1000)
    }
  }

  async authorize ({ username, extension, password, code, redirectUri }) {
    let data
    if (code) {
      data = querystring.stringify({ grant_type: 'authorization_code', code, redirect_uri: redirectUri })
    } else {
      data = querystring.stringify({ grant_type: 'password', username, extension, password })
    }
    const r = await axios({
      method: 'post',
      url: URI(this.server).path('/restapi/oauth/token').toString(),
      data,
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
      url: URI(this.server).path('/restapi/oauth/token').toString(),
      data: querystring.stringify({ grant_type: 'refresh_token', refresh_token: this._token.refresh_token }),
      headers: this._basicAuthorizationHeader()
    })
    this.token(r.data)
  }

  async revoke () {
    if (this._token === undefined) {
      return
    }
    await axios({
      method: 'post',
      url: URI(this.server).path('/restapi/oauth/revoke').toString(),
      data: querystring.stringify({ token: this._token.access_token }),
      headers: this._basicAuthorizationHeader()
    })
    this.token(undefined)
  }

  authorizeUri (redirectUri, state = '') {
    return URI(this.server).path('/restapi/oauth/authorize')
      .search({
        response_type: 'code',
        state: state,
        redirect_uri: redirectUri,
        client_id: this.clientId
      }).toString()
  }

  get (endpoint, params, headers = {}) {
    return this._request('get', endpoint, params, undefined, headers)
  }

  post (endpoint, data, params, headers = {}) {
    return this._request('post', endpoint, params, data, headers)
  }

  put (endpoint, data, params, headers = {}) {
    return this._request('put', endpoint, params, data, headers)
  }

  delete (endpoint, params, headers = {}) {
    return this._request('delete', endpoint, params, undefined, headers)
  }

  _request (method, endpoint, params, data, headers = {}) {
    const userAgentHeader = 'tylerlong/ringcentral-js-concise'
    return axios({
      method,
      url: URI(this.server).path(endpoint).toString(),
      headers: Object.assign(headers, this._bearerAuthorizationHeader(), {
        'User-Agent': userAgentHeader,
        'RC-User-Agent': userAgentHeader
      }),
      params,
      data
    })
  }

  _basicAuthorizationHeader () {
    return { Authorization: `Basic ${Base64.encode(`${this.clientId}:${this.clientSecret}`)}` }
  }

  _bearerAuthorizationHeader () {
    return { Authorization: `Bearer ${this._token.access_token}` }
  }
}

RingCentral.SANDBOX_SERVER = 'https://platform.devtest.ringcentral.com'
RingCentral.PRODUCTION_SERVER = 'https://platform.ringcentral.com'

module.exports = RingCentral
