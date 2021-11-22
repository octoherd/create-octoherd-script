import { execa } from "execa";

export default async function command(cmd) {
  console.log(`$ ${cmd}`);
  const { stdout, stderr } = await execa(cmd, { shell: true });
  return [stdout, stderr].filter(Boolean).join("\n");
}
