// FNV-1a, 32 bits, over UTF-16 code units, as 8 lowercase hex characters:
// the code index names its lookup keys and shard files with it. A copy of
// scripts/design-system/index/hash.ts (the shell does not bundle scripts/),
// pinned by the same test vectors in hash.test.ts.
export const fnv1a32 = (s: string): string => {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
};
