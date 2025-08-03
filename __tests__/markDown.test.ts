import { generateMarkDown } from '../src/markDown.js'

describe('generateMarkDown', () => {
  it('returns markdown with coverage and report', async () => {
    const result = await generateMarkDown(85, 'All tests passed!')
    expect(result).toContain('### Code Quality Report')
    expect(result).toContain('**Coverage**: 85%')
    expect(result).toContain('**Report**:')
    expect(result).toContain('```text\nAll tests passed!\n```')
  })

  it('returns markdown with default message if report is empty', async () => {
    const result = await generateMarkDown(90, '')
    expect(result).toContain('No coverage report provided.')
  })

  it('handles zero coverage', async () => {
    const result = await generateMarkDown(0, 'No tests run')
    expect(result).toContain('**Coverage**: 0%')
    expect(result).toContain('No tests run')
  })
})
