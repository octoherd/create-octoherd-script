import writePrettyFile from "./write-pretty-file.js";
import getTemplateFileContent from "./get-template-file-content.js";

export default async function createGitHubAction(actionFileName, options = {}) {
  let fileContent = getTemplateFileContent(`github-actions/${actionFileName}`);

  if (options.replace) {
    fileContent = fileContent.replace(
      options.replace.searchValue,
      options.replace.replaceValue,
    );
  }

  await writePrettyFile(`.github/workflows/${actionFileName}`, fileContent);
}
