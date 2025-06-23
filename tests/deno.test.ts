import { expect } from "jsr:@std/expect";
import jsonata from "jsonata";

import renovateConfig from "../renovate/deno.json" with { type: "json" };

Deno.test("File monitor", async (t) => {
  await t.step("matchFilePatterns", async (t) => {
    for (const filename of ["deno.json", "deno.jsonc"]) {
      await t.step(`Matched: ${filename}`, async () => {
        const patterns = renovateConfig.customManagers[0].managerFilePatterns;
        expect(
          patterns.filter((p) => filename.match(new RegExp(p.slice(1, -1)))),
        ).not.toHaveLength(0);
      });
    }
    for (const filename of ["deno.json5"]) {
      await t.step(`Unmatched: ${filename}`, async () => {
        const patterns = renovateConfig.customManagers[0].managerFilePatterns;
        expect(
          patterns.filter((p) => filename.match(new RegExp(p.slice(1, -1)))),
        ).toHaveLength(0);
      });
    }
  });
  await t.step("matchString (try JSONata)", async (t) => {
    await t.step("None imports", async () => {
      const data = {};
      const exp = jsonata(renovateConfig.customManagers[0].matchStrings[0]);
      const result = await exp.evaluate(data);
      expect(result).toBeUndefined();
    });
    await t.step("Matched single element", async () => {
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
    await t.step("Matched single element", async () => {
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
