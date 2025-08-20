import * as core from '@actions/core'
import { generateMarkDown } from './markDown.js'
import { runUnitTests } from './runUnitTests.js'

/**
 * The main function for the action.
 *
 * @returns Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  let coverage = 0
  let report = ''
  try {
    const minCoverage = core.getInput('minCoverage', { required: true })
    ;[coverage, report] = await runUnitTests()
    if (coverage < 0) {
      coverage = 0
    } else if (coverage < parseFloat(minCoverage)) {
      throw new Error(
        `Coverage ${coverage}% is below threshold ${minCoverage}%`
      )
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      core.error(`Action failed with error: ${error.message}`)
      core.setFailed(error.message)
    } else {
      core.error('Action failed with an unknown error')
      core.setFailed('Unknown error occurred')
    }
  } finally {
    const markDownReport = await generateMarkDown(coverage, report)
    await core.summary.addRaw(markDownReport, true).write()
    core.setOutput('coverage', coverage)
    core.setOutput('report', markDownReport)
  }
}
