import { mkdir, writeFile } from "fs/promises";
import { extname, dirname } from "path";

import pretier from "prettier";

export default async function writePrettyFile(path, content) {
  const ext = extname(path);

  // make sure the path exists
  await mkdir(dirname(path), { recursive: true });

  if (!ext) {
    return writeFile(path, content + "\n");
  }

  const parser = {
    ".js": "babel",
    ".json": "json",
    ".md": "markdown",
    ".ts": "typescript",
    ".yml": "yaml",
  }[ext];

  if (!parser) throw new Error(`Define parser for ${path}`);

  await writeFile(
    path,
    pretier.format(content, {
      parser,
    })
  );
}
