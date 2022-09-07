import writePrettyFile from "./write-pretty-file.js";
import getTemplateFileContent from "./get-template-file-content.js";

export default async function createRenovateConfig() {
  const renovateFileName = "renovate.json";
  let fileContent = getTemplateFileContent(renovateFileName);

  await writePrettyFile(`.github/${renovateFileName}`, fileContent);
}
