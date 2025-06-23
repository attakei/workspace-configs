import jsonata from "npm:jsonata";
import { expect } from "jsr:@std/expect";
import * as yaml from "jsr:@std/yaml";

import renovateConfig from "../renovate/taskfile.json" with { type: "json" };

Deno.test("YAML monitor", async (t) => {
  await t.step("matchFilePatterns", async (t) => {
    for (const filename of [
      "Taskfile.yaml",
      "Taskfile.yml",
      "Taskfile.dist.yaml",
      "sub/Taskfile.yml",
    ]) {
      await t.step(`Matched: ${filename}`, async () => {
        const patterns = renovateConfig.customManagers[0].managerFilePatterns;
        expect(
          patterns.filter((p) => filename.match(new RegExp(p.slice(1, -1)))),
        ).not.toHaveLength(0);
      });
    }
    for (const filename of ["taskfile.json"]) {
      await t.step(`Unmatched: ${filename}`, async () => {
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
    await t.step("Matched single element", async () => {
      const data = yaml.parse(`
      includes:
        docs:
          taskfile: 'https://github.com/attakei/workspace-configs.git//projects/sphinx-doc/Taskfile.yaml?tag=v0.2.0'
      `);
      const exp = jsonata(renovateConfig.customManagers[0].matchStrings[0]);
      const result = await exp.evaluate(data);
      expect(result).toBeDefined();
      expect(result.depName).toBe("attakei/workspace-configs");
      expect(result.currentValue).toBe("v0.2.0");
    });
    await t.step("Matched multiple element", async () => {
      const data = yaml.parse(`
      includes:
        demo:
          taskfile: 'https://github.com/attakei/workspace-configs.git//projects/sphinx-doc/Taskfile.yaml?tag=v0.2.0'
        docs:
          taskfile: 'https://github.com/attakei/workspace-configs.git//projects/sphinx-doc/Taskfile2.yaml?tag=v0.2.0'
      `);
      const exp = jsonata(renovateConfig.customManagers[0].matchStrings[0]);
      const result = await exp.evaluate(data);
      expect(result).toBeDefined();
      expect(result).toHaveLength(2);
    });
    await t.step("Matched one element only", async () => {
      const data = yaml.parse(`
      includes:
        demo:
          taskfile: './demo'
        docs:
          taskfile: 'https://github.com/attakei/workspace-configs.git//projects/sphinx-doc/Taskfile2.yaml?tag=v0.2.0'
      `);
      const exp = jsonata(renovateConfig.customManagers[0].matchStrings[0]);
      const result = await exp.evaluate(data);
      expect(result).toBeDefined();
      expect(result.depName).toBe("attakei/workspace-configs");
      expect(result.currentValue).toBe("v0.2.0");
    });
    await t.step("Unmatched local", async () => {
      const data = yaml.parse(`
      includes:
        docs:
          taskfile: './docs/'
    `);
      const exp = jsonata(renovateConfig.customManagers[0].matchStrings[0]);
      const result = await exp.evaluate(data);
      expect(result).toBeUndefined();
    });
  });
});
