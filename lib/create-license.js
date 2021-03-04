import getTemplateFileContent from "./get-template-file-content.js";
import writePrettyFile from "./write-pretty-file.js";

export default async function createLicense(name) {
  await writePrettyFile(
    "LICENSE.md",
    getTemplateFileContent("LICENSE.md")
      .replace("{{YEAR}}>", new Date().getFullYear())
      .replace("{{OWNER}}", name)
  );
}
