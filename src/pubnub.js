import PubNubSDK from 'pubnub'

class PubNub {
  constructor (rc, events, messageCallback, statusCallback = undefined, presenceCallback = undefined) {
    this.rc = rc
    this.events = events
    this.listener = {
      message: message => {
        const decrypted = this.pubnub.decrypt(message.message, this.subscription().deliveryMode.encryptionKey, {
          encryptKey: false,
          keyEncoding: 'base64',
          keyLength: 128,
          mode: 'ecb'
        })
        messageCallback(decrypted)
      },
      status: statusCallback,
      presence: presenceCallback
    }
    this._subscription = undefined
    this._timeout = undefined
  }

  subscription (_subscription) {
    if (arguments.length === 0) { // get
      return this._subscription
    }
    this._subscription = _subscription
    if (this._timeout) {
      clearTimeout(this._timeout)
      this._timeout = undefined
    }
    if (_subscription) {
      this._timeout = setTimeout(() => {
        this.refresh()
      }, (_subscription.expiresIn - 120) * 1000)
    }
  }

  async subscribe () {
    const r = await this.rc.post('/restapi/v1.0/subscription', this._requestBody())
    this.subscription(r.data)
    this.pubnub = new PubNubSDK({
      subscribeKey: this.subscription().deliveryMode.subscriberKey,
      useRandomIVs: false
    })
    this.pubnub.addListener(this.listener)
    this.pubnub.subscribe({ channels: [this.subscription().deliveryMode.address] })
  }

  async refresh () {
    if (!this.subscription()) {
      return
    }
    try {
      const r = await this.rc.put(`/restapi/v1.0/subscription/${this.subscription().id}`, this._requestBody())
      this.subscription(r.data)
    } catch (e) {
      if (e.response && e.response.status === 404) { // subscription expired
        await this.subscribe()
      }
    }
  }

  async revoke () {
    if (!this.subscription()) {
      return
    }
    this.pubnub.unsubscribe({ channels: [this.subscription().deliveryMode.address] })
    this.pubnub.removeListener(this.listener)
    this.pubnub = undefined
    await this.rc.delete(`/restapi/v1.0/subscription/${this.subscription().id}`)
    this.subscription(undefined)
  }

  _requestBody () {
    return {
      deliveryMode: { transportType: 'PubNub', encryption: true },
      eventFilters: this.events
    }
  }
}

export default PubNub
