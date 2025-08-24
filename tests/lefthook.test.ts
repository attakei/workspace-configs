import yaml from "js-yaml";
import jsonata from "jsonata";

import renovateConfig from "../renovate/lefthook.json" with { type: "json" };

describe("YAML monitor", () => {
  describe("matchFilePatterns", () => {
    test.each([
      "lefthook.yaml",
      "lefthook.yml",
      ".lefthook.yaml",
      ".lefthook.yml",
      "sub/lefthook.yml",
    ])("'%p' is target.", (filename) => {
      const patterns = renovateConfig.customManagers[0].managerFilePatterns;
      expect(
        patterns.filter((p) => filename.match(new RegExp(p.slice(1, -1)))),
      ).not.toHaveLength(0);
    });
    test.each(["lefthook.json"])("'%p' is not target.", (filename) => {
      const patterns = renovateConfig.customManagers[0].managerFilePatterns;
      expect(
        patterns.filter((p) => filename.match(new RegExp(p.slice(1, -1)))),
      ).toHaveLength(0);
    });
  });
  describe("matchString (try JSONata)", () => {
    test("None remotes", async () => {
      const data = yaml.load("");
      const exp = jsonata(renovateConfig.customManagers[0].matchStrings[0]);
      const result = await exp.evaluate(data);
      expect(result).toBeUndefined();
    });
    test("Valid", async () => {
      const data = yaml.load(`
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
