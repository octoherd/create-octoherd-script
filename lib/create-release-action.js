import writePrettyFile from "./write-pretty-file.js";

export default async function createReleaseAction({ owner }) {
  const npmTokenSecretName =
    owner === "octoherd" ? "NPM_AUTOMATION_TOKEN" : "NPM_TOKEN";
  await writePrettyFile(
    ".github/workflows/release.yml",
    `name: Release
on:
  push:
    branches:
      - main

jobs:
  release:
    name: release
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: 12
      - uses: actions/cache@v1
        with:
          path: ~/.npm
          key: \${{ runner.os }}-node-\${{ hashFiles('**/package-lock.json') }}
          restore-keys: |
            \${{ runner.os }}-node-
      - run: npm ci
      - run: npx semantic-release
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: \${{ secrets.${npmTokenSecretName} }}
`
  );
}
