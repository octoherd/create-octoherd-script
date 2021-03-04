# Create new Octoherd Script

> CLI to create a new folder and repository for an Octoherd Script

## Usage

```shell
npm init octoherd-script
```

## What it does

- Creates a new folder on your machine
- Inits git in the new folder
- Add `LICENSE`, `CODE_OF_CONDUCT.md`, `README.md` and issue templates
- Creates a repository
- Adds repository as `git remote add origin <url>`
- Push the files to main
- Creates a new local branch called `initial-version`
- Adds files for the script, CLI, and more meta files
- Creates a pull request
- Adds branch protection (if possible)
- Adds workflow files for tests and automated releases

## Contribute

Pull requests welcome!

## License

[ISC](LICENSE)
