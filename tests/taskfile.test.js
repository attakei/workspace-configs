import { readFileSync } from "node:fs";
import jsonata from "jsonata";
import yaml from "yaml";

const renovateConfig = yaml.parse(
  // NOTE: Relative path from project root.
  readFileSync("renovate/taskfile.yaml", { encoding: "utf8" }),
);

describe("YAML monitor", () => {
  describe("matchFilePatterns", () => {
    test.each([
      "Taskfile.yaml",
      "Taskfile.yml",
      "Taskfile.dist.yaml",
      "sub/Taskfile.yml",
    ])("Matched: %s", (filename) => {
      const patterns = renovateConfig.customManagers[0].managerFilePatterns;
      expect(
        patterns.filter((p) => filename.match(new RegExp(p.slice(1, -1)))),
      ).not.toHaveLength(0);
    });
    test.each(["taskfile.json"])("Unmatched: %s", (filename) => {
      const patterns = renovateConfig.customManagers[0].managerFilePatterns;
      expect(
        patterns.filter((p) => filename.match(new RegExp(p.slice(1, -1)))),
      ).toHaveLength(0);
    });
  });
  describe("matchString (try JSONata)", () => {
    test("None remotes", async () => {
      const data = yaml.parse("");
      const exp = jsonata(renovateConfig.customManagers[0].matchStrings[0]);
      const result = await exp.evaluate(data);
      expect(result).toBeUndefined();
    });
    test("Matched single element", async () => {
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
    test("Matched multiple element", async () => {
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
    test("Matched one element only", async () => {
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
    test("Unmatched local", async () => {
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
