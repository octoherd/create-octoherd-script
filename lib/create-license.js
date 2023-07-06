import getTemplateFileContent from "./get-template-file-content.js";
import writePrettyFile from "./write-pretty-file.js";

export default async function createLicense(name) {
  const templateContent = await getTemplateFileContent("LICENSE.md");
  const content = templateContent
    .replace("{{YEAR}}", new Date().getFullYear())
    .replace("{{OWNER}}", name);
  await writePrettyFile("LICENSE.md", content);
}
