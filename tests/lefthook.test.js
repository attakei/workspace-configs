import { readFile } from "node:fs/promises";
import jsonata from "jsonata";
import yaml from "yaml";

import renovateConfig from "../renovate/lefthook.json";

describe("YAML monitor", () => {
  describe("matchString (try JSONata)", () => {
    test("Valid", async () => {
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
