export async function generateMarkDown(
  coverage: number,
  report: string
): Promise<string> {
  // Construct the Markdown content
  if (report === '') {
    report = 'No coverage report provided.'
  }
  let markDown = `### Code Quality Report\n\n`
  markDown += `**Coverage**: ${coverage}%\n\n`
  markDown += `**Report**:\n\n`
  markDown += `\`\`\`text\n${report}\n\`\`\`\n\n`
  return markDown
}
