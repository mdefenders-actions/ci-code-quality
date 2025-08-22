import { jest } from '@jest/globals'
import * as core from '../__fixtures__/core.js'

jest.unstable_mockModule('@actions/core', () => core)

const { generateMarkDown } = await import('../src/markDown.js')

describe('generateMarkDown', () => {
  beforeEach(() => {
    // Mock core.getInput to return valid values
    core.getInput.mockImplementation((name: string) => {
      void name
      return 'Code Quality Report'
    })
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('returns markdown with coverage and report', async () => {
    const result = await generateMarkDown(
      85,
      'http://service.url',
      'All tests passed!'
    )
    expect(result).toContain('### Code Quality Report')
    expect(result).toContain('### **Coverage**: 85%')
    expect(result).toContain('```text\nAll tests passed!\n```')
    expect(result).toContain(
      'Service URL [http://service.url](http://service.url)'
    )
  })

  it('returns markdown with default message if report is empty', async () => {
    const result = await generateMarkDown(90, '', '')
    expect(result).toContain('No coverage report provided.')
  })

  it('handles zero coverage', async () => {
    const result = await generateMarkDown(0, '', 'No tests run')
    expect(result).toContain('**Coverage**: 0%')
    expect(result).toContain('No tests run')
  })

  it('returns markdown with no coverage', async () => {
    const result = await generateMarkDown(
      undefined,
      'http://service.url',
      'All tests passed!'
    )
    expect(result).toContain('### Code Quality Report')
    expect(result).toContain('```text\nAll tests passed!\n```')
    expect(result).toContain(
      'Service URL [http://service.url](http://service.url)'
    )
  })
})
