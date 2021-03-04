import writePrettyFile from "./write-pretty-file.js";

export default async function createScript({ description, scriptOptions }) {
  let optionsParam = "";

  const args = ["octokit", "repository"];

  if (Object.keys(scriptOptions).length) {
    optionsParam += "* @param {object} options\n";

    const optionsArgs = [];
    Object.entries(scriptOptions).forEach(([name, option]) => {
      const objName = option.required
        ? `options.${option.name}`
        : `[options.${option.name}]`;
      optionsParam += `* @param {${option.type}} ${objName} ${option.description}\n`;

      if (!option.default) {
        optionsArgs.push(option.name);
        return;
      }

      if (option.type === "number") {
        optionsArgs.push(`${option.name} = ${option.default}`);
        return;
      }

      optionsArgs.push(`${option.name} = "${option.default}"`);
    });

    args.push(`{${Object.keys(scriptOptions).join(", ")}}`);
  }

  const content = [
    `
      /**
       * ${description}
       *
       * @param {import('@octoherd/cli').Octokit} octokit
       * @param {import('@octoherd/cli').Repository} repository`,
    optionsParam.trim(),
    `  */
      export async function script(${args.join(", ")}) {
    
      }
    `,
  ].filter(Boolean);

  await writePrettyFile("script.js", content.join("\n"));
}
