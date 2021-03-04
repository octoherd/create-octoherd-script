import { readFileSync } from "fs";
import { join as pathJoin, dirname } from "path";
import { fileURLToPath } from "url";

export default function getTemplateFileContent(filename) {
  // https://stackoverflow.com/a/50052194/206879
  const __dirname = dirname(fileURLToPath(import.meta.url));

  return readFileSync(pathJoin(__dirname, "..", "templates", filename), "utf8");
}
