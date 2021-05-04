import inquirer from "inquirer";
import camelcase from "camelcase";

export default async function prompts({
  login,
  name,
  email,
  website,
  twitter_username,
}) {
  const answers1 = await inquirer.prompt([
    {
      type: "input",
      name: "packageName",
      message:
        "What npm package name should the project have? (Example: octoherd-script-hello-world)",
    },
    {
      type: "confirm",
      name: "publicAccess",
      message: (answers) =>
        `Should the package ${answers.packageName} be publicly accessible?`,
      default: true,
      when: (answers) => answers.packageName.startsWith("@"),
    },
    {
      type: "input",
      name: "description",
      message: "Description for npm package and the GitHub repository",
    },
    {
      type: "input",
      name: "repository",
      message:
        "Full name of the repository. Name must start with 'octoherd-script-' (Example: octocat/octoherd-script-hello-world)",
      default: (answers) => {
        if (answers.packageName.startsWith("@octoherd")) {
          return answers.packageName.substr(1);
        }

        return answers.packageName.startsWith("@")
          ? answers.packageName.substr(1)
          : [login, answers.packageName].join("/");
      },
      validate: (input) =>
        /^[^/]+\/octoherd-script-/.test(input) ||
        /^octoherd\/script-/.test(input),
    },
  ]);

  const { scriptOptionNames } = await inquirer.prompt({
    type: "input",
    name: "scriptOptionNames",
    message:
      "Comma-separated list of script options (camelCase). Leave empty if there are none",
    filter: (input) =>
      input
        .split(/,/)
        .map((name) => camelcase(name.trim()))
        .filter(Boolean),
  });

  const scriptOptions = {};
  for (const name of scriptOptionNames) {
    scriptOptions[name] = await inquirer.prompt([
      {
        type: "list",
        name: "type",
        message: `What type is ${name}?`,
        choices: ["string", "number", "boolean"],
      },
      {
        type: "list",
        name: "required",
        message: `Is the ${name} option optional or required?`,
        choices: ["optional", "required"],
        filter: (input) => input === "required",
        when: (answers) => answers.type !== "boolean",
      },
      {
        type: "input",
        name: "default",
        message: `Default value (if any)`,
        when: (answers) => !answers.required && answers.type !== "boolean",
      },
      {
        type: "input",
        name: "example",
        message: `Example value`,
        when: (answers) => answers.type !== "boolean",
      },
      {
        type: "input",
        name: "description",
        message: `Description for ${name} option (optional)`,
      },
    ]);
  }

  const answers2 = await inquirer.prompt([
    {
      type: "input",
      name: "packageAuthor",
      message: 'Value for "author" key in package.json',
      default: () => {
        if (!name) return;
        let author = name;

        if (email) {
          author += ` <${email}>`;
        }

        if (website) {
          author += ` (${website})`;
        } else if (twitter_username) {
          author += ` (https://twitter.com/${twitter_username})`;
        } else {
          author += ` (https://github.com/${login})`;
        }

        return author;
      },
    },
    {
      type: "input",
      name: "cocEmail",
      message:
        "What email can folks reach out to for Code of Conduct inquiries?",
      default: () =>
        answers1.packageName.startsWith("@octoherd")
          ? "octoherd+coc@martynus.net"
          : email,
    },
    {
      type: "input",
      name: "licenseName",
      message: "Name for license",
      default: () =>
        answers1.packageName.startsWith("@octoherd")
          ? "Octoherd contributors"
          : name,
    },
    {
      type: "input",
      name: "path",
      message: `Folder path to initialize the project in, relative to current path. If the path does not yet exist it will be created. Current path is ${process.cwd()})`,
      default: () => answers1.repository.split("/")[1],
    },
  ]);

  return {
    ...answers1,
    ...answers2,
    scriptOptions,
  };
}
