import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const API_ROOT = join(process.cwd(), "app", "api");
const HTTP_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"];
const WRAPPER_NAMES = ["withAuth", "withAdmin", "withPublicRoute"];

function findRouteFiles(dir: string): string[] {
  const files: string[] = [];

  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);

    if (statSync(fullPath).isDirectory()) {
      files.push(...findRouteFiles(fullPath));
    } else if (entry === "route.ts") {
      files.push(fullPath);
    }
  }

  return files;
}

function checkFile(source: string): string[] {
  const violations: string[] = [];

  for (const method of HTTP_METHODS) {
    const rawExportPattern = new RegExp(
      `export\\s+async\\s+function\\s+${method}\\s*\\(`,
    );
    const constExportPattern = new RegExp(`export\\s+const\\s+${method}\\s*=`);
    const wrappedExportPattern = new RegExp(
      `export\\s+const\\s+${method}\\s*=\\s*(${WRAPPER_NAMES.join("|")})\\b`,
    );

    if (rawExportPattern.test(source)) {
      violations.push(
        `${method} is exported as a raw function, bypassing withAuth/withAdmin/withPublicRoute - it may be unintentionally unauthenticated.`,
      );
      continue;
    }

    if (constExportPattern.test(source) && !wrappedExportPattern.test(source)) {
      violations.push(
        `${method} is exported without withAuth/withAdmin/withPublicRoute - it may be unintentionally unauthenticated.`,
      );
    }
  }

  return violations;
}

describe("route auth guardrail", () => {
  const routeFiles = findRouteFiles(API_ROOT);

  it("finds route files to check", () => {
    // Sanity check that the scan itself isn't silently finding nothing -
    // if this drops to 0, the glob logic above is broken, not the routes.
    expect(routeFiles.length).toBeGreaterThan(20);
  });

  for (const file of routeFiles) {
    const relativePath = file.slice(process.cwd().length + 1);

    it(`${relativePath} wraps every exported handler in withAuth/withAdmin/withPublicRoute`, () => {
      const source = readFileSync(file, "utf8");
      const violations = checkFile(source);

      expect(violations, violations.join("\n")).toEqual([]);
    });
  }
});
