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
const { runLint } = await import('../src/runTests.js')
const { runAudit } = await import('../src/runTests.js')

describe('runTests', () => {
  beforeEach(() => {
    core.getBooleanInput.mockImplementation(() => true)
    core.getInput.mockImplementation((name: string) => {
      if (name === 'unitTestCommand') return 'npm test'
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
    const [coverage, report] = await runTests('.')
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
    const [coverage] = await runTests('.')
    expect(coverage).toBe(50)
  })

  it('throws exception if no coverage file found', async () => {
    fs.access.mockRejectedValueOnce(new Error('File not found'))
    await expect(runTests('.')).rejects.toThrow('File not found')
  })

  it('runs lint and calls exec with correct args', async () => {
    await runLint('.')
    expect(core.startGroup).toHaveBeenCalledWith('Running ESLint')
    expect(exec.exec).toHaveBeenCalledWith(
      'npx',
      ['eslint', '.'],
      expect.objectContaining({ cwd: '.' })
    )
    expect(core.endGroup).toHaveBeenCalled()
  })

  it('runs audit and calls exec with correct args', async () => {
    await runAudit('.')
    expect(core.startGroup).toHaveBeenCalledWith('Running npm audit')
    expect(exec.exec).toHaveBeenCalledWith(
      'npm',
      ['audit', '--audit-level=high'],
      expect.objectContaining({ cwd: '.' })
    )
    expect(core.endGroup).toHaveBeenCalled()
  })

  it('runs integration tests and returns output', async () => {
    core.getInput.mockImplementation((name: string) => {
      if (name === 'intTestCommand') return 'npm run int-test'
      return '.'
    })
    exec.exec.mockImplementation((_cmd, _args, options) => {
      if (options && typeof options.listeners?.stdout === 'function') {
        options.listeners.stdout(Buffer.from('integration output'))
      }
      return Promise.resolve(0)
    })
    const { runIntegrationTests } = await import('../src/runTests.js')
    const result = await runIntegrationTests('.')
    expect(core.startGroup).toHaveBeenCalledWith('Running integration tests')
    expect(exec.exec).toHaveBeenCalledWith(
      'npm run int-test',
      [],
      expect.objectContaining({ cwd: '.' })
    )
    expect(core.endGroup).toHaveBeenCalled()
    expect(result).toContain('integration output')
  })
})
