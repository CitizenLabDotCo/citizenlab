/**
 * Build-flagged component tag. Spread onto a component's root element:
 * `<div {...gvTag('Button')} />`. Emits `data-gv-component` only when the
 * build sets VITE_GV_DESIGN_TAGS=1 (vite.config.ts does so on design-system/*
 * branches); otherwise it is `{}` and nothing reaches production markup.
 *
 * The flag goes through `process.env`, which vite.config.ts already defines
 * for the other build flags (CIRCLE_BRANCH and friends). `import.meta.env`
 * would not parse under jest's CommonJS transform.
 */
export const gvTag = (name: string): Record<string, string> =>
  process.env.VITE_GV_DESIGN_TAGS === '1' ? { 'data-gv-component': name } : {};
