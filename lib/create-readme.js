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
    content += `# 🚧 WORK IN PROGRESS. See [#1](https://github.com/${repository}/pull/1)

`;
  }

  // header
  content += `# ${repo}

> ${description}

`;

  if (addBadges) {
    content += `[![@latest](https://img.shields.io/npm/v/${packageName}.svg)](https://www.npmjs.com/package/${packageName})
[![Build Status](https://github.com/${repository}/workflows/Test/badge.svg)](https://github.com/${repository}/actions?query=workflow%3ATest+branch%3Amain)

`;
  }

  if (addUsage) {
    const usage = `npx ${packageName} \\
  --octoherd-token 0123456789012345678901234567890123456789 \\
  "${owner}/*"`;

    Object.entries(scriptOptions).forEach(([name, { required, example }]) => {
      if (!required) return;
      usage += ` \\
  --${name} ${example}`;
    });

    content += `## Usage

\`\`\`js
${usage}
\`\`\`

`;

    if (Object.keys(scriptOptions).length === 0) {
      content += `The script has no options
      
`;
    } else {
      content += `## Options
      
| option | type | description |
| --- | --- | --- |
`;

      Object.entries(scriptOptions).forEach(
        ([name, { type, required, description }]) => {
          content += `| \`--${decamelize(name, {
            separator: "-",
          })}\` | ${type} | ${required ? `**(required)**` : ""} ${description} |
`;
        }
      );
    }
  }

  // footer
  content += `## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md)
  
## License

[ISC](LICENSE.md)
`;

  await writePrettyFile(`README.md`, content);
}
