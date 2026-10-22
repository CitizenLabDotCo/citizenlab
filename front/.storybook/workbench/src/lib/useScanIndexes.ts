import { useEffect, useMemo, useState } from 'react';

import { loadScan, ScanOutput, TokenMeta } from './data';
import { buildPairs, buildUsage, PairUse, TokenUsage } from './usage';

// The scan once per page load, and its indexes once per scan.
export type Indexes = {
  loaded: boolean;
  hasScan: boolean;
  scan?: ScanOutput;
  usage: Map<string, TokenUsage>;
  pairs: PairUse[];
};

const NO_SCAN: Omit<Indexes, 'loaded'> = {
  hasScan: false,
  usage: new Map(),
  pairs: [],
};

// Built once per scan and kept across page visits; pairs only when a page
// shows them (the Colour page).
const built = new WeakMap<
  ScanOutput,
  { meta: TokenMeta[]; usage: Map<string, TokenUsage>; pairs?: PairUse[] }
>();
const indexesOf = (scan: ScanOutput, meta: TokenMeta[], withPairs: boolean) => {
  let entry = built.get(scan);
  if (!entry || entry.meta !== meta) {
    entry = { meta, usage: buildUsage(scan, meta) };
    built.set(scan, entry);
  }
  if (withPairs && !entry.pairs) entry.pairs = buildPairs(scan, meta);
  return { usage: entry.usage, pairs: entry.pairs ?? [] };
};

export const useScanIndexes = (
  meta: TokenMeta[],
  withPairs = false
): Indexes => {
  const [scan, setScan] = useState<ScanOutput | undefined>();
  useEffect(() => {
    let live = true;
    loadScan().then((s) => live && setScan(s));
    return () => {
      live = false;
    };
  }, []);
  return useMemo(() => {
    if (!scan || scan.findings.length === 0) {
      return { ...NO_SCAN, loaded: !!scan };
    }
    return {
      loaded: true,
      hasScan: true,
      scan,
      ...indexesOf(scan, meta, withPairs),
    };
  }, [scan, meta, withPairs]);
};
