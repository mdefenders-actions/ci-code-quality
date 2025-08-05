export async function generateMarkDown(
  coverage: number,
  report: string
): Promise<string> {
  // Construct the Markdown content
  if (report === '') {
    report = 'No coverage report provided.'
  }
  let markDown = `### Code Quality Report. **Coverage**: ${coverage}%\n\n`
  markDown += `\`\`\`text\n${report}\n\`\`\`\n\n`
  return markDown
}
