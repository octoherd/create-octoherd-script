#!/usr/bin/env node

import { inspect } from "util";
import { mkdir, writeFile } from "fs/promises";

import inquirer from "inquirer";
import { Octokit } from "@octokit/core";
import { createOAuthDeviceAuth } from "@octokit/auth-oauth-device";
import clipboardy from "clipboardy";

import command from "./lib/command.js";
import createBranchProtection from "./lib/create-branch-protection.js";
import createCoc from "./lib/create-coc.js";
import createContributing from "./lib/create-contributing.js";
import createIssueTemplates from "./lib/create-issue-templates.js";
import createLicense from "./lib/create-license.js";
import createPackageJson from "./lib/create-package-json.js";
import createPullRequest from "./lib/create-pull-request.js";
import createReadme from "./lib/create-readme.js";
import createReleaseAction from "./lib/create-release-action.js";
import createTestAction from "./lib/create-test-action.js";
import createRenovateConfig from "./lib/create-renovate-config.js";
import createRepository from "./lib/create-repository.js";
import createScript from "./lib/create-script.js";
import prompts from "./lib/prompts.js";
import writePrettyFile from "./lib/write-pretty-file.js";

main();

async function main() {
  const { repoIsPrivate } = await inquirer.prompt({
    name: "repoIsPrivate",
    type: "list",
    message: "Do you want to create a public or private repository?",
    choices: ["public", "private"],
    filter: (input) => input === "private",
  });

  const auth = createOAuthDeviceAuth({
    clientId: "e93735961b3b72ca5c02", // Create Octoherd Script OAuth app by @octoherd
    scopes: repoIsPrivate ? ["repo"] : ["public_repo"],
    async onVerification({ verification_uri, user_code }) {
      console.log("Open %s", verification_uri);

      await clipboardy.write(user_code);
      console.log("Paste code: %s (copied to your clipboard)", user_code);

      await inquirer.prompt({
        name: "grant_access",
        type: "confirm",
        message: "Press <enter> when ready",
      });
    },
  });

  const { token } = await auth({ type: "oauth" });
  const octokit = new Octokit({ auth: token });
  octokit.hook.before("request", async (options) => {
    const { method, url, ...parameters } =
      octokit.request.endpoint.parse(options);
    console.log(`> ${method} ${url.replace("https://api.github.com", "")}`);
    for (const [name, value] of Object.entries(parameters.headers)) {
      console.log(`  ${name}: ${value}`);
    }
    if (parameters.body) {
      console.log(``);
      for (const [name, value] of Object.entries(parameters.body)) {
        console.log(`  ${name}: ${inspect(value)}`);
      }
    }
  });

  // get user information
  const {
    data: { id: userId, login, name, email, blog: website, twitter_username },
  } = await octokit.request("GET /user");

  try {
    const answers = await prompts({
      login,
      name,
      email,
      website,
      twitter_username,
    });

    const [owner, repo] = answers.repository.split("/");
    const isUserRepo = answers.repository.startsWith(login);

    // create project folder and chdir into it
    console.log(`Creating ${answers.path}`);
    await mkdir(answers.path, { recursive: true });
    process.chdir(answers.path);

    await command("git init");
    await command("git checkout -b main");

    await createLicense(answers.licenseName);
    console.log(`LICENSE created`);

    await createCoc(answers.cocEmail);
    console.log(`CODE_OF_CONDUCT.md created`);

    await createContributing({ owner, repo, packageName: answers.packageName });
    console.log(`CONTRIBUTING.md created`);

    await createReadme({
      addWip: true,
      repository: answers.repository,
      repo,
      description: answers.description,
    });
    console.log(`README.md created`);

    await command("git add LICENSE.md");
    await command(`git commit -m "docs(LICENSE): ISC"`);

    await command("git add CODE_OF_CONDUCT.md");
    await command(
      `git commit -m "docs(CODE_OF_CONDUCT): Contributor Covenant"`,
    );

    await command("git add CONTRIBUTING.md");
    await command(`git commit -m "docs(CONTRIBUTING): initial version"`);

    await command("git add README.md");
    await command(`git commit -m "docs(README): initial version"`);

    await createIssueTemplates(answers.packageName);
    await command("git add .github/ISSUE_TEMPLATE");
    await command(`git commit -m "docs(ISSUE_TEMPLATES): initial version"`);

    const {
      data: { id: repositoryId },
    } = await createRepository(octokit, {
      isUserRepo,
      owner,
      repo,
      description: answers.description,
      repoIsPrivate,
    });

    await command(
      `git remote add origin git@github.com:${answers.repository}.git`,
    );
    await command(`git push -u origin HEAD`);
    await command(`git checkout -b initial-version`);

    await createReadme({
      repo,
      description: answers.description,
    });

    await command(`git commit README.md -m "docs(README): remove WIP note"`);
    await command(`git push -u origin HEAD`);

    let ownerId = userId;
    if (!isUserRepo) {
      const { data } = await octokit.request("GET /orgs/{org}", {
        org: owner,
      });
      ownerId = data.id;
    }

    await createPullRequest(octokit, {
      owner,
      repo,
      ownerId,
      repositoryId,
    });

    await createPackageJson(owner, repo, answers);
    console.log("Install dependencies");
    const dependencies = ["@octoherd/cli"];

    await command(`npm install ${dependencies.join(" ")}`);

    await command(`git add package.json`);
    await command(`git commit -m "build(package): initial version"`);
    await command(`git add package-lock.json`);
    await command(`git commit -m "build(package): lock file"`);

    console.log("Create branch protection for main");
    try {
      await createBranchProtection(octokit, { owner, repo });
    } catch (error) {
      if (error.status !== 403) throw error;

      console.log(
        "Branch protection could not be enabled, because the repository is private and belongs to an organization using the free plan",
      );
    }

    const ignorePaths = ["node_modules"];
    await writePrettyFile(".gitignore", ignorePaths.join("\n"));
    await command(`git add .gitignore`);
    await command(
      `git commit -m "build(gitignore): ${ignorePaths.join(", ")}"`,
    );

    console.log("create script.js and cli.js");
    await createScript(answers);
    await writeFile(
      // we cannot use writePrettyFile, it blows because of the #! in the first line
      "cli.js",
      `#!/usr/bin/env node

import { script } from "./script.js";
import { run } from "@octoherd/cli/run";

run(script);
`,
    );

    await command(`git add script.js cli.js`);
    await command(`git commit -m "feat: initial version"`);

    await createReadme({
      addBadges: true,
      repo,
      description: answers.description,
      packageName: answers.packageName,
      repository: answers.repository,
    });
    await command(`git commit README.md -m "docs(README): badges"`);

    await createReadme({
      addBadges: true,
      addUsage: true,
      owner,
      repo,
      description: answers.description,
      packageName: answers.packageName,
      repository: answers.repository,
      scriptOptions: answers.scriptOptions,
    });
    await command(`git commit README.md -m "docs(README): usage"`);

    console.log("Create actions");
    await createReleaseAction({ owner });
    await command(`git add .github/workflows/release.yml`);
    await command(`git commit -m "ci(release): initial version"`);

    await createTestAction();
    await command(`git add .github/workflows/test.yml`);
    await command(`git commit -m "ci(test): initial version"`);

    if (owner === "octoherd") {
      await createRenovateConfig();
      await command(`git add .github/renovate.json`);
      await command(`git commit -m "build(renovate): create renovate setup"`);
    }

    await command(`git push`);

    console.log(`Your new repository is here:
https://github.com/${answers.repository}

To change into the new directory, do
$ cd ${answers.path}`);
  } catch (error) {
    console.log(error);
  }

  console.log("All done.");
}
