import axios from 'axios'
import { Base64 } from 'js-base64'
import querystring from 'querystring'
import URI from 'urijs'
import EventEmitter from 'events'
import multipartMixedParser from 'multipart-mixed-parser'

class HTTPError extends Error {
  constructor (status, statusText, data, config) {
    super(`status: ${status}
statusText: ${statusText}
data: ${JSON.stringify(data, null, 2)}
config: ${JSON.stringify(config, null, 2)}`)
    this.status = status
    this.statusText = statusText
    this.data = data
    this.config = config
  }
}

class RingCentral extends EventEmitter {
  constructor (clientId, clientSecret, server, axiosInstance) {
    super()
    this.clientId = clientId
    this.clientSecret = clientSecret
    this.server = server
    this._token = undefined
    this._axios = axiosInstance || axios.create()
    const request = this._axios.request.bind(this._axios)
    this._axios._request = async config => { // do not try to refresh token
      try {
        return await request(config)
      } catch (e) {
        if (e.response) {
          throw new HTTPError(e.response.status, e.response.statusText, e.response.data, e.response.config)
        }
        throw e
      }
    }
    this._axios.request = async config => { // try to refresh token if necessary
      try {
        return await request(config)
      } catch (e) {
        if (e.response) {
          if ((e.response.data.errors || []).some(error => /\btoken\b/i.test(error.message))) { // access token expired
            try {
              console.log(JSON.stringify(e.response.data))
              await this.refresh()
              config.headers = { ...config.headers, ...this._bearerAuthorizationHeader() }
              return await request(config)
            } catch (e) {
              if (e.response) {
                throw new HTTPError(e.response.status, e.response.statusText, e.response.data, e.response.config)
              }
              throw e
            }
          }
          throw new HTTPError(e.response.status, e.response.statusText, e.response.data, e.response.config)
        }
        throw e
      }
    }
  }

  token (_token) {
    if (arguments.length === 0) { // get
      return this._token
    }
    const tokenChanged = this._token !== _token
    this._token = _token
    if (tokenChanged) {
      this.emit('tokenChanged', _token)
    }
  }

  async authorize ({ username, extension, password, code, redirectUri }, options = {}) {
    let data
    if (code) {
      data = querystring.stringify({ grant_type: 'authorization_code', code, redirect_uri: redirectUri, ...options })
    } else {
      data = querystring.stringify({ grant_type: 'password', username, extension, password, ...options })
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
    if (!this.refreshRequest) {
      this.refreshRequest = this._axios._request({
        method: 'post',
        url: URI(this.server).path('/restapi/oauth/token').toString(),
        data: querystring.stringify({ grant_type: 'refresh_token', refresh_token: this._token.refresh_token }),
        headers: this._basicAuthorizationHeader()
      })
    }
    const r = await this.refreshRequest
    this.token(r.data)
    this.refreshRequest = undefined
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
    return this._axios.request({
      ...config,
      url: uri.toString(),
      headers: this._patchHeaders(config.headers)
    })
  }

  get (url, config = {}) {
    return this.request({ ...config, method: 'get', url })
  }

  delete (url, config = {}) {
    return this.request({ ...config, method: 'delete', url })
  }

  post (url, data = undefined, config = {}) {
    return this.request({ ...config, method: 'post', url, data })
  }

  put (url, data = undefined, config = {}) {
    return this.request({ ...config, method: 'put', url, data })
  }

  patch (url, data = undefined, config = {}) {
    return this.request({ ...config, method: 'patch', url, data })
  }

  async batchGet (url, ids, batchSize, config = {}) {
    const cache = {}
    const result = []
    for (let i = 0; i < ids.length; i += batchSize) {
      let someIds = ids.slice(i, i + batchSize)
      if (someIds.length <= 1) {
        someIds = [...someIds, ids[0]] // turn single record fetch to batch fetch
      }
      const r = await this.get(`${url}/${someIds.join(',')}`, config)
      for (const item of multipartMixedParser.parse(r.data).slice(1).filter(p => 'id' in p)) {
        if (!cache[item.id]) {
          cache[item.id] = true
          result.push(item)
        }
      }
    }
    return result
  }

  _patchHeaders (headers) {
    const userAgentHeader = 'tylerlong/ringcentral-js-concise'
    return {
      ...headers,
      ...this._bearerAuthorizationHeader(),
      'X-User-Agent': userAgentHeader,
      'RC-User-Agent': userAgentHeader
    }
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
