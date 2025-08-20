import { jest } from '@jest/globals'

export const runUnitTests =
  jest.fn<typeof import('../src/runUnitTests.js').runUnitTests>()
export const runLint =
  jest.fn<typeof import('../src/runUnitTests.js').runLint>()
export const runAudit =
  jest.fn<typeof import('../src/runUnitTests.js').runAudit>()
