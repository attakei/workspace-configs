/**
 * Build Renovate configurations from YAML format to JSON format.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { glob } from "glob";
import { program } from "commander";
import yaml from "yaml";

program.argument("<string>");

program.parse();
for (const src of glob.globSync(`${program.args[0]}/*.yaml`)) {
  const dest = src.replace(/\.yaml$/, ".json");
  console.debug(`Build from ${src}\n  to ${dest}`);
  const config = yaml.parse(readFileSync(src, { encoding: "utf8" }));
  if (config.customManagers) {
    for (const mgr of config.customManagers) {
      if (!mgr.matchStrings) {
        continue;
      }
      mgr.matchStrings = mgr.matchStrings.map((ms) => ms.replaceAll("\n", ""));
    }
  }
  writeFileSync(dest, JSON.stringify(config, null, 2));
}
