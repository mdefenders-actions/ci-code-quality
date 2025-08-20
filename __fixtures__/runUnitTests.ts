import { jest } from '@jest/globals'

export const runUnitTests =
  jest.fn<typeof import('../src/runUnitTests.js').runUnitTests>()
