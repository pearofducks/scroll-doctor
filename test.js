import { test } from 'node:test'
import assert from 'node:assert/strict'
import { GlobalRegistrator } from '@happy-dom/global-registrator'
import { setStyles, resetStyles, styleTargets } from './index.js'

await test('html and body attributes', async (t) => {
  t.beforeEach(() => {
    GlobalRegistrator.register()
  })
  t.afterEach(() => {
    GlobalRegistrator.unregister()
  })

  await t.test('attributes are all set', () => {
    setStyles()
    withAllTargets(({ target, k, v }) => {
      assert.equal(document[target].style[k], v)
    })
  })

  await t.test('attributes are all torn down when reset', () => {
    // some attributes like height won't take an arbitrary word, but all take this
    const RESET_WORD = '100%'
    withAllTargets(({ target, k }) => {
      document[target].style[k] = RESET_WORD
    })
    setStyles()
    resetStyles()
    withAllTargets(({ target, k }) => {
      assert.equal(document[target].style[k], RESET_WORD)
    })
  })
})

function withAllTargets(cb) {
  for (const [target, styles] of Object.entries(styleTargets)) {
    for (const [k, v] of Object.entries(styles)) {
      cb({ target, k, v })
    }
  }
}
