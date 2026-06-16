/**
 * Scans free-text answer *values* for personal data (e.g. an email someone
 * typed into a comment box) and redacts it. This complements field-level
 * redaction: even fields the admin keeps can have PII removed from their text.
 *
 * Over-redaction is preferred to leaking PII, so patterns lean conservative-
 * but-broad. The same patterns drive both the in-modal summary and the actual
 * replacement applied to the exported PDF.
 */

export const REDACTION_PLACEHOLDER = '[REDACTED]';

export type ContentPiiType = 'email' | 'phone' | 'postcode';

type ContentPattern = {
  type: ContentPiiType;
  // `g` flag is required: we both iterate matches and use String#replace.
  pattern: RegExp;
};

const CONTENT_PATTERNS: ContentPattern[] = [
  {
    type: 'email',
    pattern: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,
  },
  {
    // Phone numbers: 9+ digits, optionally with +, spaces, dashes, parentheses.
    type: 'phone',
    pattern: /(?:\+?\d[\d\s().-]{8,}\d)/g,
  },
  {
    // UK postcodes, e.g. "SW1A 1AA", "M1 1AE".
    type: 'postcode',
    pattern: /\b[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}\b/gi,
  },
];

export type ContentMatch = {
  type: ContentPiiType;
  values: string[];
};

/**
 * Scan a set of free-text values and return the distinct PII values found,
 * grouped by type. Only types with at least one match are returned.
 */
export const scanContent = (texts: string[]): ContentMatch[] => {
  const found: Record<ContentPiiType, Set<string>> = {
    email: new Set(),
    phone: new Set(),
    postcode: new Set(),
  };

  texts.forEach((text) => {
    CONTENT_PATTERNS.forEach(({ type, pattern }) => {
      const matches = text.match(pattern);
      matches?.forEach((match) => found[type].add(match.trim()));
    });
  });

  return CONTENT_PATTERNS.map(({ type }) => ({
    type,
    values: Array.from(found[type]),
  })).filter((match) => match.values.length > 0);
};

/** Replace any detected PII values within a string with the placeholder. */
export const redactContent = (text: string): string =>
  CONTENT_PATTERNS.reduce(
    (acc, { pattern }) => acc.replace(pattern, REDACTION_PLACEHOLDER),
    text
  );
