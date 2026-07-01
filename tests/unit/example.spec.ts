import { describe, it, expect } from 'vitest'
import { isRuleValid } from '../../src/types'

describe('Example Unit Tests', () => {
  it('demonstrates basic unit testing with Vitest', () => {
    const sum = (a: number, b: number) => a + b
    expect(sum(2, 3)).toBe(5)
  })

  it('can import project types', () => {
    // Example of importing and testing actual project code
    expect(typeof isRuleValid).toBe('function')
  })
})
