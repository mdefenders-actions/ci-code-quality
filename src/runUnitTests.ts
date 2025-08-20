import * as core from '@actions/core'
import { exec } from '@actions/exec'
import * as fs from 'fs/promises'

export async function runLint(relativePath: string): Promise<void> {
  core.startGroup('Running ESLint')
  await exec('npx', ['eslint', '.'], {
    cwd: relativePath,
    failOnStdErr: true
  })
  core.endGroup() // Construct the Markdown content
}

export async function runAudit(relativePath: string): Promise<void> {
  core.startGroup('Running npm audit')
  await exec('npm', ['audit', '--audit-level=high'], {
    cwd: relativePath,
    failOnStdErr: true
  })
  core.endGroup()
}

export async function runUnitTests(
  relativePath: string
): Promise<[number, string]> {
  // Construct the Markdown content

  const unitTestCommand = core.getInput('unitTestCommand', { required: true })

  core.startGroup('Running tests')
  const output: Buffer[] = []
  const coverageFile = `${relativePath}/coverage/coverage-summary.json`
  await exec('mkdir', ['-p', 'coverage'], { cwd: relativePath })
  await exec(
    unitTestCommand,
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
