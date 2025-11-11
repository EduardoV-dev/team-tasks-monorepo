export default {
    "*.{ts,mts}": ["pnpm format:check", "pnpm lint:check", () => "pnpm build:check"],
    "*.{js,mjs}": ["pnpm format:check", "pnpm lint:check"],
    "*.{json,yaml,yml}": ["pnpm format:check"],
};
