import jsonata from "jsonata";

import renovateConfig from "../renovate/deno.json" with { type: "json" };

describe("File monitor", () => {
  describe("matchFilePatterns", () => {
    test.each(["deno.json", "deno.jsonc"])(
      "'%p' must be matched",
      (filename) => {
        const patterns = renovateConfig.customManagers[0].managerFilePatterns;
        expect(
          patterns.filter((p) => filename.match(new RegExp(p.slice(1, -1)))),
        ).not.toHaveLength(0);
      },
    );
    test.each(["deno.json5"])("'%p' doesn't be matched", (filename) => {
      const patterns = renovateConfig.customManagers[0].managerFilePatterns;
      expect(
        patterns.filter((p) => filename.match(new RegExp(p.slice(1, -1)))),
      ).toHaveLength(0);
    });
  });
  describe("matchString (try JSONata", () => {
    test("None imports", async () => {
      const data = {};
      const exp = jsonata(renovateConfig.customManagers[0].matchStrings[0]);
      const result = await exp.evaluate(data);
      expect(result).toBeUndefined();
    });
    test("Matched single element", async () => {
      const data = {
        imports: {
          "@luca/cases": "jsr:@luca/cases@1.0.0",
          cowsay: "npm:cowsay@1.6.0",
          cases: "https://deno.land/x/case/mod.ts",
        },
      };
      const exp = jsonata(renovateConfig.customManagers[0].matchStrings[0]);
      const result = await exp.evaluate(data);
      expect(result).toBeDefined();
      expect(result.depName).toBe("cowsay");
      expect(result.currentValue).toBe("1.6.0");
    });
    test("Matched single element", async () => {
      const data = {
        imports: {
          "@luca/cases": "jsr:@luca/cases@1.0.0",
          cowsay: "npm:cowsay@1.6.0",
          textlint: "npm:textlint@14.0.0",
        },
      };
      const exp = jsonata(renovateConfig.customManagers[0].matchStrings[0]);
      const result = await exp.evaluate(data);
      expect(result).toBeDefined();
      expect(result).toHaveLength(2);
    });
  });
});
