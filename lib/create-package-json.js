import writePrettyFile from "./write-pretty-file.js";

export default async function createPackageJson(owner, repo, answers) {
  const binName = owner === "octoherd" ? `octoherd-${repo}` : repo;
  const pkg = {
    name: answers.packageName,
    version: "0.0.0-development",
    type: "module",
    exports: "./script.js",
    bin: {
      [binName]: "./cli.js",
    },
    description: answers.description,
    scripts: {
      start: "node cli.js",
      test: "node script.js",
    },
    repository: `https://github.com/${answers.repository}`,
    keywords: ["octoherd-script"],
    author: answers.packageAuthor,
    license: "ISC",
    dependencies: {},
    devDependencies: {},
    release: {
      branches: ["main"],
    },
  };

  if (answers.publicAccess) {
    pkg.publishConfig = {
      access: "public",
    };
  }

  await writePrettyFile("package.json", JSON.stringify(pkg));
}
