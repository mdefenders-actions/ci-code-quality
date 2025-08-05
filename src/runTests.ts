import * as core from '@actions/core'
import { exec } from '@actions/exec'
import * as fs from 'fs/promises'

export async function runTests(): Promise<[number, string]> {
  // Construct the Markdown content
  const runLint = core.getBooleanInput('runLint', { required: true })
  const runAudit = core.getBooleanInput('runAudit', { required: true })
  const runTests = core.getBooleanInput('runTests', { required: true })
  const testCommand = core.getInput('testCommand', { required: true })
  const relativePath = core.getInput('relativePath', { required: true })

  if (runLint) {
    core.startGroup('Running ESLint')
    await exec('npx', ['eslint', '.'], {
      cwd: relativePath,
      failOnStdErr: true
    })
    core.endGroup()
  }

  if (runAudit) {
    core.startGroup('Running npm audit')
    await exec('npm', ['audit', '--audit-level=high'], {
      cwd: relativePath,
      failOnStdErr: true
    })
    core.endGroup()
  }

  if (runTests) {
    core.startGroup('Running tests')
    const output: Buffer[] = []
    const coverageFile = `${relativePath}/coverage/coverage-summary.json`
    await exec('mkdir', ['-p', 'coverage'], { cwd: relativePath })
    await exec(
      testCommand,
      [
        '--coverageReporters=json-summary',
        '--coverageReporters=text',
        '--coverageReporters=html'
      ],
      {
        cwd: relativePath,
        listeners: {
          stdout: (data: Buffer) => output.push(data)
        }
      }
    )
    await fs.access(coverageFile)
    const {
      total: {
        statements: { pct: coverage }
      }
    } = JSON.parse(await fs.readFile(coverageFile, 'utf-8'))
    core.info(`Detected coverage: ${coverage}%`)
    core.endGroup()
    return [coverage, Buffer.concat(output).toString('utf-8')]
  }
  return [-1, 'No coverage check requested']
}
