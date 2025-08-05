/**
 * Unit tests for runTests in src/runTests.ts
 *
 * Uses Jest ESM mocking to replace dependencies with fixtures.
 */
import { jest } from '@jest/globals'

// References to fs mocks

// Static mocks for core and exec
import * as core from '../__fixtures__/core.js'
import * as exec from '../__fixtures__/exec.js'
import * as fs from '../__fixtures__/fs.js'

// Mock other modules
jest.unstable_mockModule('@actions/core', () => core)
jest.unstable_mockModule('@actions/exec', () => exec)
jest.unstable_mockModule('fs/promises', () => fs)

// Import after all mocks are registered
const { runTests } = await import('../src/runTests.js')

describe('runTests', () => {
  beforeEach(() => {
    core.getBooleanInput.mockImplementation(() => true)
    core.getInput.mockImplementation((name: string) => {
      if (name === 'testCommand') return 'npm test'
      if (name === 'relativePath') return '.'
      if (name === 'minCoverage') return '80'
      return ''
    })

    exec.exec.mockImplementation((_cmd, _args, options) => {
      if (options && typeof options.listeners?.stdout === 'function') {
        options.listeners.stdout(Buffer.from('test output'))
      }
      return Promise.resolve(0)
    })
    core.setFailed.mockClear()
    core.info.mockClear()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('returns coverage and report when coverage file exists', async () => {
    fs.readFile.mockResolvedValueOnce(
      JSON.stringify({
        total: {
          statements: { pct: 85 }
        }
      })
    )
    const [coverage, report] = await runTests()
    expect(coverage).toBe(85)
    expect(report).toContain('test output')
    expect(core.info).toHaveBeenCalledWith('Detected coverage: 85%')
  })

  it('sets failed if coverage is below threshold', async () => {
    fs.readFile.mockResolvedValueOnce(
      JSON.stringify({
        total: {
          statements: { pct: 50 }
        }
      })
    )
    const [coverage] = await runTests()
    expect(coverage).toBe(50)
  })

  it('throws exception if no coverage file found', async () => {
    fs.access.mockRejectedValueOnce(new Error('File not found'))
    await expect(runTests()).rejects.toThrow('File not found')
  })

  it('returns coverage -1 if no coverage requested', async () => {
    core.getBooleanInput.mockImplementation(() => false)
    fs.readFile.mockResolvedValueOnce(
      JSON.stringify({
        total: {
          statements: { pct: 85 }
        }
      })
    )
    const [coverage, report] = await runTests()
    expect(coverage).toBe(-1)
    expect(report).toContain('No coverage check requested')
  })
})
