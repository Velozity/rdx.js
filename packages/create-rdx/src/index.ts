#!/usr/bin/env node
import { Command } from "commander";
import chalk from "chalk";
import prompts from "prompts";
import ora from "ora";
import { execa } from "execa";
import fs from "fs-extra";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const program = new Command();
program.name("create-rdx").version("1.0.0").argument("[app]").action(async (name) => {
  console.log(chalk.cyan(" create-rdx"));
  const answers = await prompts([
    { type: name ? null : "text", name: "projectName", message: "Project name?", initial: "my-app" },
    { type: "text", name: "appId", message: "Application ID (https://dev.rootapp.com/apps)?", validate: v => v.length > 5 },
    { type: "text", name: "devToken", message: "DEV_TOKEN (https://dev.rootapp.com/apps)?", validate: v => v.length > 5 },
    { type: "select", name: "pm", message: "Package manager?", choices: [{ title: "pnpm", value: "pnpm" }], initial: 0 }
  ]);
  let projName = name || answers.projectName;
  projName = projName.replace("@", "");

  const targetDir = path.resolve(process.cwd(), projName);
  const spinner = ora("Creating...").start();
  try {
    await fs.copy(path.join(__dirname, "..", "template"), targetDir);
    
    // Replace @rdx.js-example with user's project name in all package.json files
    const packageJsonPaths = [
      path.join(targetDir, "package.json"),
      path.join(targetDir, "server", "package.json"),
      path.join(targetDir, "client", "package.json"),
      path.join(targetDir, "networking", "package.json"),
      path.join(targetDir, "networking", "gen", "client", "package.json"),
      path.join(targetDir, "networking", "gen", "server", "package.json"),
      path.join(targetDir, "networking", "gen", "shared", "package.json"),
    ];
    
    for (const pkgPath of packageJsonPaths) {
      if (await fs.pathExists(pkgPath)) {
        const content = await fs.readFile(pkgPath, "utf-8");
        const updated = content.replace(/@rdx\.js-example/g, `@${projName}`);
        await fs.writeFile(pkgPath, updated);
      }
    }
    
    // Replace @rdx.js-example in root-protoc.json
    const rootProtocPath = path.join(targetDir, "networking", "root-protoc.json");
    if (await fs.pathExists(rootProtocPath)) {
      const content = await fs.readFile(rootProtocPath, "utf-8");
      const updated = content.replace(/@rdx\.js-example/g, `@${projName}`);
      await fs.writeFile(rootProtocPath, updated);
    }
    
    // Replace xxxxx with application ID in root-manifest.json
    const rootManifestPath = path.join(targetDir, "root-manifest.json");
    if (await fs.pathExists(rootManifestPath)) {
      const content = await fs.readFile(rootManifestPath, "utf-8");
      const updated = content.replace(/xxxxx/g, answers.appId);
      await fs.writeFile(rootManifestPath, updated);
    }
    
    await fs.writeFile(path.join(targetDir, "server", ".env"), `DEV_TOKEN=${answers.devToken}\n`);
    spinner.succeed("Done!");
    console.log(`\ncd ${projName}\n${answers.pm} install\n${answers.pm} run dev:server\n`);
  } catch (e) {
    spinner.fail("Error");
    console.error(e);
  }
});
program.parse();
