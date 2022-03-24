import { it } from 'mocha'
import { should } from 'chai'
import { simpleHash } from '../src'

describe('SimpleHash', () => {
  it('should return correct hash string with default params', () => {
    const hash = simpleHash([1, 2, 3])
    return should().equal(hash, '3530513397947785053296897142557895557120')
  })
  it('should return correct hash string with length param', () => {
    const hash = simpleHash([1, 2, 3], null, 77)
    return should().equal(hash, '1259729275322113643079999203492506359813191573070980317691663537897682854338069790720')
  })
  it('should return correct hash string with seed param', () => {
    const hash = simpleHash(['1', '2', '3'], 123)
    return should().equal(hash, '1371592418687375416654554138100746944512')
  })
})
