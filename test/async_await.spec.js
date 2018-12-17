/* eslint-env jest */
import delay from 'timeout-as-promise'

describe('async await', () => {
  test('default', async () => {
    const f = async () => {
      await delay(2000)
      return 1
    }
    await f()
    await f()
  })
  test('async promise', async () => {
    const f = async () => {
      await delay(2000)
      return 1
    }
    const p = f()
    await p
    await p
  })
  test('promise', async () => {
    const p = new Promise((resolve, reject) => {
      setTimeout(() => resolve(1), 2000)
    })
    await p
    await p
  })
})
