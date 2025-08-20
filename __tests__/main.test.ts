/**
 * Unit tests for the action's main functionality, src/main.ts
 *
 * Uses Jest ESM mocking to replace dependencies with fixtures.
 */
import { jest } from '@jest/globals'
import * as core from '../__fixtures__/core.js'
import { runUnitTests } from '../__fixtures__/runUnitTests.js'
import { generateMarkDown } from '../__fixtures__/markDown.js'

// Mock dependencies before importing the module under test
jest.unstable_mockModule('@actions/core', () => core)
jest.unstable_mockModule('../src/runUnitTests.js', () => ({
  runUnitTests: runUnitTests
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
      if (name === 'testCommand') return 'npm test'
      return 'true'
    })
    // Mock runUnitTests to return a valid tuple
    runUnitTests.mockImplementation(() => Promise.resolve([100, 'done!']))
    // Mock generateMarkDown to return the report string (second value from runUnitTests)
    generateMarkDown.mockImplementation((coverage: number, report: string) =>
      Promise.resolve(report)
    )
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('sets the coverage and report outputs', async () => {
    await run()
    expect(core.setOutput).toHaveBeenCalledWith('coverage', 100)
    expect(core.setOutput).toHaveBeenCalledWith('report', 'done!')
  })

  it('sets a failed status on error', async () => {
    runUnitTests.mockImplementationOnce(() =>
      Promise.reject(new Error('test error'))
    )
    await run()
    expect(core.setFailed).toHaveBeenCalledWith('test error')
  })
  it('throws an unknown error', async () => {
    runUnitTests.mockImplementationOnce(() => Promise.reject('unknown error'))
    await run()
    expect(core.setFailed).toHaveBeenCalledWith('Unknown error occurred')
  })
  it('Test no coverage requested', async () => {
    runUnitTests.mockImplementation(() =>
      Promise.resolve([-1, 'No coverage check requested!'])
    )
    await run()
    expect(core.setOutput).toHaveBeenCalledWith('coverage', 0)
    expect(core.setOutput).toHaveBeenCalledWith(
      'report',
      'No coverage check requested!'
    )
  })
  it('handle coverage below the threshold', async () => {
    runUnitTests.mockImplementation(() => Promise.resolve([10, 'done!']))
    await run()
    expect(core.setFailed).toHaveBeenCalledWith(
      'Coverage 10% is below threshold 80%'
    )
  })
})
