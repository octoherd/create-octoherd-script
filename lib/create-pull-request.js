export default async function createPullRequest(
  octokit,
  { owner, repo, ownerId, repositoryId },
) {
  let body = `Your new script is ready to be implemented :tada:

You can run it locally on your machine with

\`\`\`
node cli.js
\`\`\`

Once you are happy with it, push your changes to this pull request

\`\`\`
git commit -a -m "feat: initial version"
git push
\`\`\`

Before merging:

- [ ] [Install the Octoherd GitHub App](https://github.com/apps/octoherd/installations/new/permissions?suggested_target_id=${ownerId}&repository_ids[]=${repositoryId})
`;

  if (owner !== "octoherd") {
    body += `- [ ] Add \`NPM_TOKEN\` to the [repository secrets](https://github.com/${owner}/${repo}/settings/secrets). Set it to an [npm automation token](https://docs.npmjs.com/creating-and-viewing-access-tokens#creating-access-tokens)`;
  }

  const options = {
    owner,
    repo,
    head: "initial-version",
    base: "main",
    title:
      owner === "octoherd"
        ? "🚧 feat: Initial version"
        : "feat: Initial version",
    body,
  };
  await octokit.request("POST /repos/{owner}/{repo}/pulls", options);
}
