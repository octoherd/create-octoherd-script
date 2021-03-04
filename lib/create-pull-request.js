export default async function createPullRequest(
  octokit,
  { owner, repo, ownerId, repositoryId }
) {
  let body = `- [ ] Implement features. Create separate \`feat: ...\` commits for each feature of the initial version
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
