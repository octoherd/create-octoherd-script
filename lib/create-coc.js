import getTemplateFileContent from "./get-template-file-content.js";
import writePrettyFile from "./write-pretty-file.js";

export default async function createCoc(email) {
  const contributorCovenantText = getTemplateFileContent(
    "CODE_OF_CONDUCT.md",
  ).replace("{{EMAIL}}", email);
  await writePrettyFile("CODE_OF_CONDUCT.md", contributorCovenantText);
}
