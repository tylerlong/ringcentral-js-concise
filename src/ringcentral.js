import axios from 'axios'
import { Base64 } from 'js-base64'
import querystring from 'querystring'
import URI from 'urijs'
import EventEmitter from 'events'
import * as R from 'ramda'

class RingCentral extends EventEmitter {
  constructor (clientId, clientSecret, server, axiosInstance) {
    super()
    this.clientId = clientId
    this.clientSecret = clientSecret
    this.server = server
    this._token = undefined
    this._timeout = undefined
    this.autoRefresh = false
    this._axios = axiosInstance || axios.create()
  }

  token (_token) {
    if (arguments.length === 0) { // get
      return this._token
    }
    const tokenChanged = this._token !== _token
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
    if (tokenChanged) {
      this.emit('tokenChanged', _token)
    }
  }

  async authorize ({ username, extension, password, code, redirectUri }) {
    let data
    if (code) {
      data = querystring.stringify({ grant_type: 'authorization_code', code, redirect_uri: redirectUri })
    } else {
      data = querystring.stringify({ grant_type: 'password', username, extension, password })
    }
    const r = await this._axios.request({
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
    const r = await this._axios.request({
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
    await this._axios.request({
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
    let uri = URI(config.url)
    if (uri.hostname() === '') {
      uri = URI(this.server).path(config.url)
    }
    return this._axios.request(R.merge(config, {
      url: uri.toString(),
      headers: this._patchHeaders(config.headers)
    }))
  }

  get (url, config = {}) {
    return this.request(R.merge(config, { method: 'get', url }))
  }

  delete (url, config = {}) {
    return this.request(R.merge(config, { method: 'delete', url }))
  }

  post (url, data = undefined, config = {}) {
    return this.request(R.merge(config, { method: 'post', url, data }))
  }

  put (url, data = undefined, config = {}) {
    return this.request(R.merge(config, { method: 'put', url, data }))
  }

  patch (url, data = undefined, config = {}) {
    return this.request(R.merge(config, { method: 'patch', url, data }))
  }

  _patchHeaders (headers) {
    const userAgentHeader = 'tylerlong/ringcentral-js-concise'
    return R.merge(headers, R.merge(this._bearerAuthorizationHeader(), {
      'X-User-Agent': userAgentHeader,
      'RC-User-Agent': userAgentHeader
    }))
  }

  _basicAuthorizationHeader () {
    return { Authorization: `Basic ${Base64.encode(`${this.clientId}:${this.clientSecret}`)}` }
  }

  _bearerAuthorizationHeader () {
    let accessToken = ''
    if (this._token) {
      accessToken = this._token.access_token
    }
    return { Authorization: `Bearer ${accessToken}` }
  }
}

RingCentral.SANDBOX_SERVER = 'https://platform.devtest.ringcentral.com'
RingCentral.PRODUCTION_SERVER = 'https://platform.ringcentral.com'

export default RingCentral
