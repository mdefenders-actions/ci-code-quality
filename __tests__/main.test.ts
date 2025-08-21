/**
 * Unit tests for the action's main functionality, src/main.ts
 *
 * Uses Jest ESM mocking to replace dependencies with fixtures.
 */
import { jest } from '@jest/globals'
import * as core from '../__fixtures__/core.js'
import { runTests, runLint, runAudit } from '../__fixtures__/runTests.js'
import { generateMarkDown } from '../__fixtures__/markDown.js'
import { runIntegrationTests } from '../__fixtures__/runTests.js'

// Mock dependencies before importing the module under test
jest.unstable_mockModule('@actions/core', () => core)
jest.unstable_mockModule('../src/runTests.js', () => ({
  runTests,
  runLint,
  runAudit,
  runIntegrationTests
}))
jest.unstable_mockModule('../src/markDown.js', () => ({ generateMarkDown }))

// Import the module under test after mocks are set up
const { run } = await import('../src/main.js')

describe('main.ts', () => {
  beforeEach(() => {
    // Mock core.getInput to return valid values
    core.getInput.mockImplementation((name: string) => {
      if (name === 'minCoverage') return '80'
      if (name === 'relativePath') return '.'
      if (name === 'unitTestCommand') return 'npm test'
      return 'true'
    })
    core.getBooleanInput.mockReturnValue(true) // Mock runTests to return a valid tuple
    runTests.mockResolvedValue([100, 'done!'])
    runIntegrationTests.mockResolvedValue('done!')
    // Mock generateMarkDown to return the report string (second value from runTests)
    generateMarkDown.mockImplementation(
      (coverage: number | null | undefined, report: string) =>
        Promise.resolve(report)
    )
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('sets no tests allowed', async () => {
    core.getBooleanInput.mockReturnValue(false) // Mock runTests to return a valid tuple

    await run()
    expect(core.setOutput).toHaveBeenCalledWith('coverage', undefined)
    expect(core.setOutput).toHaveBeenCalledWith('report', '')
  })

  it('sets the coverage and report outputs', async () => {
    await run()
    expect(core.setOutput).toHaveBeenCalledWith('coverage', 100)
    expect(core.setOutput).toHaveBeenCalledWith('report', 'done!')
  })

  it('sets a failed status on error', async () => {
    runTests.mockImplementationOnce(() =>
      Promise.reject(new Error('test error'))
    )
    await run()
    expect(core.setFailed).toHaveBeenCalledWith('test error')
  })
  it('throws an unknown error', async () => {
    runTests.mockImplementationOnce(() => Promise.reject('unknown error'))
    await run()
    expect(core.setFailed).toHaveBeenCalledWith('Unknown error occurred')
  })
  it('handle coverage below the threshold', async () => {
    runTests.mockImplementation(() => Promise.resolve([10, 'done!']))
    await run()
    expect(core.setFailed).toHaveBeenCalledWith(
      'Coverage 10% is below threshold 80%'
    )
  })
})
