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
    const r = await axios.request({
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
    const r = await axios.request({
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
    await axios.request({
      method: 'post',
      url: URI(this.server).path('/restapi/oauth/revoke').toString(),
      data: querystring.stringify({ token: this._token.access_token }),
      headers: this._basicAuthorizationHeader()
    })
    this.token(undefined)
  }

  authorizeUri (redirectUri, options = { responseType: 'code', state: '', brandId: '', display: '', prompt: '' }) {
    return URI(this.server).path('/restapi/oauth/authorize')
      .search({
        redirect_uri: redirectUri,
        client_id: this.clientId,
        response_type: options.responseType || 'code',
        state: options.state || '',
        brand_id: options.brandId || '',
        display: options.display || '',
        prompt: options.prompt || ''
      }).toString()
  }

  request (config) {
    config.url = URI(this.server).path(config.url).toString()
    config.headers = this._patchHeaders(config.headers)
    return axios.request(config)
  }

  get (url, config = {}) {
    config.method = 'get'
    config.url = url
    return this.request(config)
  }

  delete (url, config = {}) {
    config.method = 'delete'
    config.url = url
    return this.request(config)
  }

  post (url, data = undefined, config = {}) {
    config.method = 'post'
    config.url = url
    config.data = data
    return this.request(config)
  }

  put (url, data = undefined, config = {}) {
    config.method = 'put'
    config.url = url
    config.data = data
    return this.request(config)
  }

  patch (url, data = undefined, config = {}) {
    config.method = 'patch'
    config.url = url
    config.data = data
    return this.request(config)
  }

  _patchHeaders (headers) {
    if (!headers) {
      headers = {}
    }
    const userAgentHeader = 'tylerlong/ringcentral-js-concise'
    return Object.assign(headers, this._bearerAuthorizationHeader(), {
      'X-User-Agent': userAgentHeader,
      'RC-User-Agent': userAgentHeader
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
