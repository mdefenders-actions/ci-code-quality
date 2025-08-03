import { jest } from '@jest/globals'

export const runTests = jest.fn<typeof import('../src/runTests.js').runTests>()
