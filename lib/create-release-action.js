import createGitHubAction from "./create-github-action.js";

export default async function createReleaseAction({ owner }) {
  const npmTokenSecretName =
    owner === "octoherd" ? "NPM_AUTOMATION_TOKEN" : "NPM_TOKEN";

  await createGitHubAction('release.yml', {
    replace: {
      searchValue: '__npmTokenSecretName__',
      replaceValue: npmTokenSecretName
    }
  })
}
