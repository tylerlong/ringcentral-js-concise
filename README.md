# ringcentral-js-concise

Concise JavaScript SDK for RingCentral.


## Installation

```
yarn add ringcentral-js-concise
```


## Usage

```
import RingCentral from 'ringcentral-js-concise'

const rc = new RingCentral('client-id', 'client-secret', RingCentral.SANDBOX_SERVER)
rc.authorize('username', 'extension', 'password')
const r = rc.get('/restapi/v1.0/account/~/extension/~').then(r => {
  console.log(r)
})
```
