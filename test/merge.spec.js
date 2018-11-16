/* eslint-env jest */
import * as R from 'ramda'
import dotenv from 'dotenv'

dotenv.config()

const a = { a: 1 }
const b = { b: 2 }
const c = { c: 3 }

describe('merge', () => {
  test('Ramda', () => {
    expect(R.merge(a, R.merge(b, c))).toEqual({ a: 1, b: 2, c: 3 })
  })

  test('spread syntax', () => {
    expect({ ...a, ...b, ...c }).toEqual({ a: 1, b: 2, c: 3 })
  })
})
