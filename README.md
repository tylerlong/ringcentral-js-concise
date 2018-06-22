# ringcentral-js-concise

[![npm version](https://badge.fury.io/js/ringcentral-js-concise.svg)](https://badge.fury.io/js/ringcentral-js-concise)

Concise JavaScript SDK for RingCentral.


## Installation

### Node.js

```
yarn add ringcentral-js-concise
```


### or CDN

```html
<script src="https://unpkg.com/axios@0.18.0/dist/axios.min.js"></script>
<script src="https://unpkg.com/ringcentral-js-concise@0.4.6/dist/ringcentral.js"></script>
```

`ringcentral-js-concise` depends on `axios`. With the code above you will have a global variable named `RingCentral`.


## Usage

```js
import RingCentral from 'ringcentral-js-concise'

const rc = new RingCentral('client-id', 'client-secret', RingCentral.SANDBOX_SERVER)
rc.authorize({ username: 'username', extension: 'extension', password: 'password' })
const r = await rc.get('/restapi/v1.0/account/~/extension/~')
const extension = r.data
```


### Get & set token

```js
const token = rc.token() // get
rc.token(token) // set
```


### Auto refresh token

Token expires. If you want the SDK to call `rc.refresh()` for you automatically:

```js
rc.autoRefresh = true
```

### HTTP Methods: get, post, put, delete

[HTTP Methods](/test/ringcentral.spec.js)


### Send SMS

[Send SMS](/test/sms.spec.js)


### Send Fax

[Send Fax](/test/fax.spec.js)


### Batch Get

[Batch Get](/test/batch_get.spec.js)


### More examples

Please refer to [test cases](/test).


## Test

```
mv .env.sample .env
edit .env
yarn test
```
