/**
 * FNV-1a, 32 bits, over UTF-16 code units, as 8 lowercase hex characters.
 * The workbench shell uses the same function (lib/trace/hash.ts), pinned by
 * the same test vectors.
 */
export const fnv1a32 = (s: string): string => {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
};
