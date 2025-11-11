import process from "node:process";

import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import prettier from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";
import eslintPluginPrettier from "eslint-plugin-prettier";
import globals from "globals";

export default [
    js.configs.recommended,
    {
        files: ["**/*.ts"],
        languageOptions: {
            parser: tsparser,
            sourceType: "module",
            parserOptions: {
                project: "./tsconfig.json",
                tsconfigRootDir: process.cwd(),
            },
            globals: {
                ...globals.node,
                ...globals.es2022,
            },
        },
        plugins: {
            "@typescript-eslint": tseslint,
            import: importPlugin,
            prettier: eslintPluginPrettier,
        },
        rules: {
            ...tseslint.configs.recommended.rules,
            "prettier/prettier": ["error"],
            "import/order": [
                "error",
                {
                    groups: [
                        "builtin",
                        "external",
                        "internal",
                        ["parent", "sibling", "index"],
                        "object",
                        "type",
                    ],
                    "newlines-between": "always",
                    alphabetize: { order: "asc", caseInsensitive: true },
                },
            ],
            "no-console": "error",
            "import/first": "error",
            "import/newline-after-import": "error",
            "import/no-duplicates": "error",
            "import/no-unresolved": "off",
            "import/named": "off",
            "import/default": "off",
            "import/namespace": "off",
            "import/no-extraneous-dependencies": [
                "error",
                { devDependencies: ["**/*.test.ts", "**/*.spec.ts", "**/test/**"] },
            ],
            "@typescript-eslint/no-unused-vars": [
                "warn",
                {
                    argsIgnorePattern: "^_",
                    varsIgnorePattern: "^_",
                    caughtErrors: "none",
                },
            ],
        },
    },
    {
        files: ["**/*.js", "**/*.mjs"],
        languageOptions: {
            sourceType: "module",
            globals: {
                ...globals.node,
                ...globals.es2022,
            },
        },
        plugins: {
            import: importPlugin,
            prettier: eslintPluginPrettier,
        },
        rules: {
            "prettier/prettier": ["error"],
            "import/order": [
                "error",
                {
                    groups: [
                        "builtin",
                        "external",
                        "internal",
                        ["parent", "sibling", "index"],
                        "object",
                        "type",
                    ],
                    "newlines-between": "always",
                    alphabetize: { order: "asc", caseInsensitive: true },
                },
            ],
            "import/first": "error",
            "import/newline-after-import": "error",
            "import/no-duplicates": "error",
            "import/no-unresolved": "off",
            "import/named": "off",
            "import/default": "off",
            "import/namespace": "off",
        },
    },
    // Disable rules that would conflict with Prettier
    prettier,
    {
        ignores: ["dist", "node_modules", "**/node_modules", "apps/**/.serverless"],
    },
];
