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
program
  .name("create-rdx")
  .version("1.0.0")
  .option("--app <name>", "Project name")
  .action(async (options) => {
    console.log(chalk.cyan(" create-rdx"));
    const answers = await prompts([
      {
        type: options.app ? null : "text",
        name: "projectName",
        message: "Project name?",
        initial: "my-app",
      },
      {
        type: "text",
        name: "appId",
        message: "Application ID (https://dev.rootapp.com/apps)?",
        initial: "Leave Empty",
      },
      {
        type: "text",
        name: "devToken",
        message: "DEV TOKEN (https://dev.rootapp.com/apps)?",
        initial: "Leave Empty",
      },
      {
        type: "select",
        name: "pm",
        message: "Package manager?",
        choices: [{ title: "pnpm", value: "pnpm" }],
        initial: 0,
      },
    ]);

    let projName = options.app || answers.projectName;
    projName = projName.replace("@", "");

    const targetDir = path.resolve(process.cwd(), projName);
    const spinner = ora("Creating...").start();
    try {
      // Copy template with filter to exclude unnecessary files
      await fs.copy(path.join(__dirname, "..", "template"), targetDir, {
        dereference: true, // Don't preserve hard links, copy actual files
        filter: (src) => {
          const basename = path.basename(src);
          // Exclude node_modules, lock files, build artifacts, and db files
          return !basename.match(
            /^(node_modules|dist|\.turbo|.*\.sqlite3|.*\.db|pnpm-lock\.yaml|package-lock\.json|yarn\.lock)$/
          );
        },
      });

      // Rename npmrc.template to .npmrc
      const npmrcTemplate = path.join(targetDir, "npmrc.template");
      const npmrcTarget = path.join(targetDir, ".npmrc");
      if (await fs.pathExists(npmrcTemplate)) {
        await fs.move(npmrcTemplate, npmrcTarget);
      }

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

      // Replace @rdx.js-example in .tsx and .ts files
      const replaceInFiles = async (dir: string) => {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            await replaceInFiles(fullPath);
          } else if (entry.name.endsWith(".tsx") || entry.name.endsWith(".ts")) {
            const content = await fs.readFile(fullPath, "utf-8");
            if (content.includes("@rdx.js-example")) {
              const updated = content.replace(/@rdx\.js-example/g, `@${projName}`);
              await fs.writeFile(fullPath, updated);
            }
          }
        }
      };
      await replaceInFiles(targetDir);

      // Replace xxxxx with application ID in root-manifest.json
      if (answers.appId === "Leave Empty") answers.appId = "XXXXXXXXXXXXXXXXXXXXXXXX";
      const rootManifestPath = path.join(targetDir, "root-manifest.json");
      if (await fs.pathExists(rootManifestPath)) {
        const content = await fs.readFile(rootManifestPath, "utf-8");
        const updated = content.replace(/xxxxxxxxxxxxxxxxxxxxxx/g, answers.appId);
        await fs.writeFile(rootManifestPath, updated);
      }

      await fs.writeFile(
        path.join(targetDir, "server", ".env"),
        `DEV_TOKEN=${answers.devToken === "Leave Empty" ? "XXXXXXXXXXXXXXXXXXXXXXXX" : answers.devToken}\n`
      );
      spinner.succeed("Done!");

      // Install dependencies
      spinner.start("Installing dependencies...");
      await execa(answers.pm, ["install"], { cwd: targetDir, stdio: "inherit" });
      spinner.succeed("Dependencies installed!");

      // Build proto files
      spinner.start("Building protocol buffers...");
      await execa(answers.pm, ["run", "build:initial"], {
        cwd: path.join(targetDir, "networking"),
        stdio: "inherit",
      });
      spinner.succeed("Protocol buffers built!");

      // Install dependencies again to link the generated packages
      spinner.start("Linking generated packages...");
      await execa(answers.pm, ["install"], { cwd: targetDir, stdio: "inherit" });
      spinner.succeed("Generated packages linked!");

      console.log(chalk.green("\n✨ Project created successfully!\n"));
      console.log(chalk.cyan("Next steps:\n"));
      console.log(`  cd ${chalk.bold(projName)}`);
      console.log(
        `  ${chalk.bold(answers.pm + " run dev:server")}   ${chalk.dim("# Start the server")}`
      );
      console.log(
        `  ${chalk.bold(answers.pm + " run dev:client")}   ${chalk.dim("# Start the client (in a new terminal)")}\n`
      );
    } catch (e) {
      spinner.fail("Error");
      console.error(e);
    }
  });
program.parse();
