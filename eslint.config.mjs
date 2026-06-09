import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "mock_claude_design/**",
    "next-env.d.ts",
  ]),
  {
    files: [
      "components/audit-plan/calendar-screen.tsx",
      "components/audit-plan/event-form-drawer.tsx",
      "components/audit-plan/list/audit-table.tsx",
    ],
    rules: {
      // TODO: remove these suppressions when these prototype screens are connected to real data.
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/static-components": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  {
    files: ["components/audit-plan/import/**/*.tsx", "components/audit-plan/import-screen.tsx"],
    rules: {
      // TODO: remove this suppression when the import prototype is implemented for real.
      "react/no-unescaped-entities": "off",
    },
  },
  {
    files: ["scripts/seed-v1.mjs"],
    rules: {
      // TODO: remove once legacy boolean standard fields are fully gone from the seed transform.
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
]);

export default eslintConfig;
