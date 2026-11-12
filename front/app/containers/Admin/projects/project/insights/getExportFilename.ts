// Non-Latin characters take 2-3 bytes each, and the saved name also gets a
// timestamp, so 60 characters keeps it under the 255-byte filename limit.
const MAX_LENGTH = 60;

// Unicode-aware so titles in any script (Arabic, Cyrillic…) keep their name.
// \p{M} keeps combining marks, which many scripts need to stay readable, and
// the zero-width (non-)joiners are needed to spell Persian and Urdu words.
const getExportFilename = (title: string, phaseId: string) => {
  const sanitized = title
    .replace(/[^\p{L}\p{M}\p{N}‌‍\s-]/gu, '')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase();
  // Array.from splits by code point, so the cut never breaks a character.
  const truncated = Array.from(sanitized)
    .slice(0, MAX_LENGTH)
    .join('')
    .replace(/-+$/, '');

  // Joiners left over from emoji sequences would give an invisible name.
  return /[\p{L}\p{N}]/u.test(truncated) ? truncated : `phase-${phaseId}`;
};

export default getExportFilename;
