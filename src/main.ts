import * as core from '@actions/core'
import { generateMarkDown } from './markDown.js'
import { runAudit, runIntegrationTests, runLint, runTests } from './runTests.js'

/**
 * The main function for the action.
 *
 * @returns Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  let coverage
  let report = ''
  let url = ''
  try {
    const relativePath = core.getInput('relativePath', { required: true })
    const lintEnabled = core.getBooleanInput('runLint', { required: true })
    const auditEnabled = core.getBooleanInput('runAudit', { required: true })
    const unitTestsEnabled = core.getBooleanInput('runUnitTests', {
      required: true
    })
    const intTestsEnabled = core.getBooleanInput('runIntegrationTests', {
      required: true
    })

    if (lintEnabled) {
      await runLint(relativePath)
    }
    if (auditEnabled) {
      await runAudit(relativePath)
    }
    if (unitTestsEnabled) {
      const minCoverage = core.getInput('minCoverage', { required: true })
      ;[coverage, report] = await runTests(relativePath)

      if (coverage < parseFloat(minCoverage))
        throw new Error(
          `Coverage ${coverage}% is below threshold ${minCoverage}%`
        )
    }
    if (intTestsEnabled) {
      report = await runIntegrationTests(relativePath)
      const appName = core.getInput('appName', { required: true })
      const servicePort = core.getInput('servicePort', { required: true })
      const serviceDomain = core.getInput('serviceDomain', { required: true })
      const namespace = core.getInput('namespace', { required: true })
      const prefix = core.getInput('prefix', { required: true })
      url = `${prefix}${appName}.${namespace}.${serviceDomain}:${servicePort}`
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
    const markDownReport = await generateMarkDown(coverage, url, report)
    await core.summary.addRaw(markDownReport, true).write()
    core.setOutput('coverage', coverage)
    core.setOutput('report', markDownReport)
  }
}
