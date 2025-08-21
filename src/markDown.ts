import * as core from '@actions/core'

export async function generateMarkDown(
  coverage: number | undefined | null,
  report: string
): Promise<string> {
  // Construct the Markdown content
  if (report === '') {
    report = 'No coverage report provided.'
  }
  let markDown = ''
  const reportTitle = core.getInput('reportTitle', { required: true })
  markDown = `### ${reportTitle}\n\n`
  if (coverage !== undefined && coverage !== null && !isNaN(coverage)) {
    markDown += `### **Coverage**: ${coverage}%\n\n`
  }
  markDown += `\`\`\`text\n${report}\n\`\`\`\n\n`

  return markDown
}
