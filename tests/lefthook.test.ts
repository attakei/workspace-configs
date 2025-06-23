import jsonata from "npm:jsonata";
import { expect } from "jsr:@std/expect";
import * as yaml from "jsr:@std/yaml";

import renovateConfig from "../renovate/lefthook.json" with { type: "json" };

Deno.test("YAML monitor", async (t) => {
  await t.step("matchFilePatterns", async (t) => {
    for (const filename of [
      "lefthook.yaml",
      "lefthook.yml",
      ".lefthook.yaml",
      ".lefthook.yml",
      "sub/lefthook.yml",
    ]) {
      await t.step(`Matched: ${filename}`, () => {
        const patterns = renovateConfig.customManagers[0].managerFilePatterns;
        expect(
          patterns.filter((p) => filename.match(new RegExp(p.slice(1, -1)))),
        ).not.toHaveLength(0);
      });
    }
    for (const filename of ["lefthook.json"]) {
      await t.step(`Unmatched: ${filename}`, () => {
        const patterns = renovateConfig.customManagers[0].managerFilePatterns;
        expect(
          patterns.filter((p) => filename.match(new RegExp(p.slice(1, -1)))),
        ).toHaveLength(0);
      });
    }
  });
  await t.step("matchString (try JSONata)", async (t) => {
    await t.step("None remotes", async () => {
      const data = yaml.parse("");
      const exp = jsonata(renovateConfig.customManagers[0].matchStrings[0]);
      const result = await exp.evaluate(data);
      expect(result).toBeUndefined();
    });
    await t.step("Valid", async () => {
      const data = yaml.parse(`
      remotes:
        - git_url: 'https://github.com/attakei/workspace-configs'
          ref: 'v0.2.0'
          configs:
            - 'projects/sphinx-doc/lefthook.yaml'
    `);
      const exp = jsonata(renovateConfig.customManagers[0].matchStrings[0]);
      const result = await exp.evaluate(data);
      expect(result).toHaveLength(1);
      expect(result[0].depName).toBe("attakei/workspace-configs");
      expect(result[0].currentValue).toBe("v0.2.0");
    });
  });
});
