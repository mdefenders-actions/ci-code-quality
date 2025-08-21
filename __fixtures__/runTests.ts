import { jest } from '@jest/globals'
import { runIntegrationTests } from '../src/runTests'

export const runTests = jest.fn<typeof import('../src/runTests.js').runTests>()
export const runLint = jest.fn<typeof import('../src/runTests.js').runLint>()
export const runAudit = jest.fn<typeof import('../src/runTests.js').runAudit>()
export const runIntegrationTests =
  jest.fn<typeof import('../src/runTests.js').runIntegrationTests>()
