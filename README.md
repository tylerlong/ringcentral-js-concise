# ringcentral-js-concise

Concise JavaScript SDK for RingCentral.


## Installation

```
yarn add ringcentral-js-concise
```


## Usage

```js
import RingCentral from 'ringcentral-js-concise'

const rc = new RingCentral('client-id', 'client-secret', RingCentral.SANDBOX_SERVER)
rc.authorize({ username: 'username', extension: 'extension', password: 'password' })
const r = rc.get('/restapi/v1.0/account/~/extension/~').then(r => {
  console.log(r)
})
```


## For repo maintainers

### Setup

```
yarn install
```

### Build

```
yarn build
```
