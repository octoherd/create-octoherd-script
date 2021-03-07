import createGitHubAction from "./create-github-action.js";

export default async function createTestAction() {
  await createGitHubAction("test.yml");
}
