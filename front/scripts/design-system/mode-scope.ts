/**
 * The redesign scope: the files whose markup renders only under <ModeScope>
 * (data-gv-mode="redesign"), so only their redesign token values ever show.
 * Used by the heal skill's mode check (mode-check.ts).
 *
 * Decided from the import graph, on the strict side. A file is inside when
 * - it renders <ModeScope> itself (a root), or every runtime importer of it
 *   (tests, stories and mocks aside) is inside; and
 * - it does not portal: no Modal, tooltip, dropdown, popover or date picker
 *   and no createPortal, whose content mounts in #modal-portal or <body>,
 *   outside the attribute.
 * A file one outside importer reaches may render outside, so it is outside,
 * even when that importer only hands it to a scoped component as a prop.
 * Library files are never inside: they render everywhere.
 */
import type { ImportRef } from './scan/routes';

export type ScopeGraph = {
  files: string[];
  source: (file: string) => string;
  imports: (file: string) => ImportRef[];
  resolve: (from: string, spec: string) => string | undefined;
};

export const PORTAL_NAME =
  /(Modal|Tooltip|Tippy|Popover|Popup|Dropdown|DatePicker|Portal|Drawer)/;

const LIBRARY = 'app/component-library/';
const DESIGN_SYSTEM = 'app/design-system/';
const NOT_RUNTIME =
  /(\.(test|spec|stories)\.[jt]sx?$)|(\/(__mocks__|__tests__)\/)/;

const runtimeImports = (g: ScopeGraph, file: string) =>
  g
    .imports(file)
    .filter(
      (i) =>
        !i.typeOnly &&
        (i.dynamic || i.names.length === 0 || i.names.some((n) => !n.typeOnly))
    );

/** True when the file mounts something outside its own DOM subtree. */
export const portals = (g: ScopeGraph, file: string): boolean => {
  if (/\bcreatePortal\b/.test(g.source(file))) return true;
  return runtimeImports(g, file).some(
    (i) =>
      PORTAL_NAME.test(i.spec.split('/').pop() ?? '') ||
      i.names.some((n) => !n.typeOnly && PORTAL_NAME.test(n.imported))
  );
};

export const scopeRoots = (g: ScopeGraph): string[] =>
  g.files.filter(
    (f) =>
      !f.startsWith(DESIGN_SYSTEM) &&
      !NOT_RUNTIME.test(f) &&
      /<ModeScope[\s>]/.test(g.source(f))
  );

export const redesignScope = (g: ScopeGraph): Set<string> => {
  const roots = scopeRoots(g);
  const deps = new Map<string, string[]>();
  const importers = new Map<string, Set<string>>();
  for (const f of g.files) {
    if (NOT_RUNTIME.test(f)) continue;
    const ds = runtimeImports(g, f)
      .map((i) => g.resolve(f, i.spec))
      .filter((d): d is string => !!d);
    deps.set(f, ds);
    ds.forEach((d) => {
      if (!importers.has(d)) importers.set(d, new Set());
      importers.get(d)?.add(f);
    });
  }
  // Candidates: what the roots reach, outside the library.
  const inside = new Set<string>();
  const queue = [...roots];
  while (queue.length) {
    const f = queue.pop() as string;
    if (inside.has(f) || f.startsWith(LIBRARY)) continue;
    inside.add(f);
    (deps.get(f) ?? []).forEach((d) => queue.push(d));
  }
  const rootSet = new Set(roots);
  let changed = true;
  while (changed) {
    changed = false;
    for (const f of [...inside]) {
      const outsideImporter =
        !rootSet.has(f) &&
        [...(importers.get(f) ?? [])].some((i) => !inside.has(i));
      if (outsideImporter || portals(g, f)) {
        inside.delete(f);
        changed = true;
      }
    }
  }
  return inside;
};
