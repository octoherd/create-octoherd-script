export default async function createRepository(
  octokit,
  { isUserRepo, owner, repo, description, repoIsPrivate },
) {
  const createRepoOptions = {
    name: repo,
    description,
    private: repoIsPrivate,
    has_wiki: false,
    has_projects: false,
    allow_merge_commit: false,
    allow_rebase_merge: false,
    delete_branch_on_merge: true,
  };

  let repositoryResponse;
  if (isUserRepo) {
    repositoryResponse = octokit.request("POST /user/repos", createRepoOptions);
  } else {
    repositoryResponse = octokit.request("POST /orgs/{org}/repos", {
      org: owner,
      ...createRepoOptions,
    });
  }

  // waiting 3s until #6 is resolved
  await new Promise((resolve) => setTimeout(resolve, 3000));

  // add topic
  await octokit.request("PUT /repos/{owner}/{repo}/topics", {
    mediaType: {
      previews: ["mercy"],
    },
    owner,
    repo,
    names: ["octoherd-script"],
  });

  return repositoryResponse;
}
