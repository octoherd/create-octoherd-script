import writePrettyFile from "./write-pretty-file.js";
import { readFile } from "fs/promises";

export default async function createGitHubAction(actionFileName, options) {
	const fileContent = (await readFile(`../templates/github-actions/${actionFileName}`, 'utf-8'))

	if (options.replace) {
		fileContent = fileContent.replace(options.replace.searchValue, options.replace.replaceValue)
	}
	
	await writePrettyFile(`.github/workflows/${actionFileName}`, fileContent);
}
