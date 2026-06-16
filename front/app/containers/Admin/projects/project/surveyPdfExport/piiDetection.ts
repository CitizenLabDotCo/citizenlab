/**
 * Lightweight, heuristic detection of survey fields that are likely to contain
 * personally identifiable information (PII), based on the field's key and label.
 *
 * This is intentionally conservative: it only flags fields for the admin to
 * review, it does not inspect answer values, and the admin always has the final
 * say over what is included in the export.
 *
 * Patterns cover universal PII plus a set of UK-specific identifiers, since the
 * original use case was UK planning consultations.
 */

export type PiiPattern = {
  pattern: RegExp;
  reason: string;
};

export const PII_PATTERNS: PiiPattern[] = [
  // Identity
  { pattern: /first[\s\-_]?name/i, reason: 'first name' },
  { pattern: /last[\s\-_]?name/i, reason: 'last name' },
  { pattern: /sur[\s\-_]?name/i, reason: 'surname' },
  { pattern: /full[\s\-_]?name/i, reason: 'full name' },
  { pattern: /\bname\b/i, reason: 'name' },
  // Contact
  { pattern: /e[\s\-_]?mail/i, reason: 'email address' },
  { pattern: /\bphone\b/i, reason: 'phone number' },
  { pattern: /\bmobile\b/i, reason: 'mobile number' },
  { pattern: /telephone/i, reason: 'telephone number' },
  // Address / location
  { pattern: /\baddress\b/i, reason: 'address' },
  { pattern: /post[\s\-_]?code/i, reason: 'postcode' },
  { pattern: /\bzip\b/i, reason: 'zip code' },
  { pattern: /\btown\b/i, reason: 'town' },
  // Date of birth
  { pattern: /date[\s\-_]?of[\s\-_]?birth/i, reason: 'date of birth' },
  { pattern: /\bdob\b/i, reason: 'date of birth' },
  // UK-specific identifiers
  {
    pattern: /national[\s\-_]?insurance/i,
    reason: 'National Insurance number',
  },
  { pattern: /\bnino\b/i, reason: 'National Insurance number' },
  { pattern: /\bnhs\b/i, reason: 'NHS number' },
  { pattern: /\buprn\b/i, reason: 'Unique Property Reference Number' },
  { pattern: /council[\s\-_]?tax/i, reason: 'council tax reference' },
];

export type DetectableField = {
  key: string;
  label: string;
};

export type PiiField = {
  key: string;
  label: string;
  /** A short reason this field was flagged, or null when not flagged. */
  reason: string | null;
  /** Whether this field will be excluded from the export. */
  redact: boolean;
};

const findReason = (field: DetectableField): string | null => {
  const haystacks = [field.label, field.key];
  for (const haystack of haystacks) {
    const match = PII_PATTERNS.find((p) => p.pattern.test(haystack));
    if (match) return match.reason;
  }
  return null;
};

/**
 * Given the list of survey fields, return a reviewable list where any field
 * matching a PII pattern is pre-flagged for redaction.
 */
export const detectPiiFields = (fields: DetectableField[]): PiiField[] =>
  fields.map((field) => {
    const reason = findReason(field);
    return {
      key: field.key,
      label: field.label,
      reason,
      redact: reason !== null,
    };
  });
