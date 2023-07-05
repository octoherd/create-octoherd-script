import decamelize from "decamelize";

import writePrettyFile from "./write-pretty-file.js";

export default async function createReadme({
  repository,
  owner,
  repo,
  description,
  packageName,
  addWip,
  addBadges,
  addUsage,
  scriptOptions,
}) {
  let content = "";

  if (addWip) {
    // WIP banner
    content += `# 🚧 WORK IN PROGRESS. See [#1](https://github.com/${repository}/pull/1) | [Preview](https://github.com/${repository}/tree/initial-version)

`;
  }

  // header
  content += `# ${repo}\n\n`;

  if (description) {
    content += `> ${description}\n\n`;
  }

  if (addBadges) {
    content += `[![@latest](https://img.shields.io/npm/v/${packageName}.svg)](https://www.npmjs.com/package/${packageName})
[![Build Status](https://github.com/${repository}/workflows/Test/badge.svg)](https://github.com/${repository}/actions?query=workflow%3ATest+branch%3Amain)

`;
  }

  if (addUsage) {
    let minimalUsage = `npx ${packageName}@latest`;
    let fullUsage = `npx ${packageName}@latest \\
  -T ghp_0123456789abcdefghjklmnopqrstuvwxyzA \\
  -R "${owner}/*"`;

    Object.entries(scriptOptions).forEach(
      ([name, { type, required, example }]) => {
        if (!required) return;
        if (type === "boolean") {
          const CliOption = decamelize(name, {
            separator: "-",
          });
          minimalUsage += ` \\
        --${CliOption}`;
        } else {
          minimalUsage += ` \\
        --${name} ${example}`;
        }
      },
    );
    Object.entries(scriptOptions).forEach(([name, { type, example }]) => {
      if (type === "boolean") {
        const CliOption = decamelize(name, {
          separator: "-",
        });
        fullUsage += ` \\
        --${CliOption}`;
      } else {
        fullUsage += ` \\
        --${name} ${example}`;
      }
    });

    content += `## Usage

Minimal usage

\`\`\`js
${minimalUsage}
\`\`\`

Pass all options as CLI flags to avoid user prompts

\`\`\`js
${fullUsage}
\`\`\`


`;

    content += `## Options
      
| option | type | description |
| --- | --- | --- |
`;

    Object.entries(scriptOptions).forEach(
      ([name, { type, required, description, default: defaultValue }]) => {
        const CliOption = decamelize(name, {
          separator: "-",
        });
        let optionNames = `\`--${CliOption}\``;
        if (type === "boolean") {
          optionNames += ` or \`--no-${CliOption}\``;
        }

        content += `| ${optionNames} | ${type} | ${
          required ? `**Required.**` : ""
        } ${description}${
          defaultValue
            ? `. Defaults to ${
                type === "string" ? `"${defaultValue}"` : defaultValue
              }`
            : ""
        } |
`;
      },
    );

    content += `| \`--octoherd-token\`, \`-T\` | string | A personal access token ([create](https://github.com/settings/tokens/new?scopes=repo)). Script will create one if option is not set |\n`;
    content += `| \`--octoherd-repos\`, \`-R\` | array of strings | One or multiple space-separated repositories in the form of \`repo-owner/repo-name\`. \`repo-owner/*\` will find all repositories for one owner. \`*\` will find all repositories the user has access to. Will prompt for repositories if not set |\n`;
    content += `| \`--octoherd-bypass-confirms\` | boolean | Bypass prompts to confirm mutating requests |\n\n`;
  }

  // footer
  content += `## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md)

## About Octoherd

[@octoherd](https://github.com/octoherd/) is project to help you keep your GitHub repositories in line.
  
## License

[ISC](LICENSE.md)
`;

  await writePrettyFile(`README.md`, content);
}
