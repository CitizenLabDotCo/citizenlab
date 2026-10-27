// The tokens a traced value can become: those whose `legacy` list in the
// token data (tokens.meta.json) names the code the value is read from
// ('theme.borderRadius', 'bo.borderRadius', 'fontSizes.base'). Never from
// comparing values: a token that only happens to equal the value is the
// picker's "Nearest tokens", not a suggestion.
import type { TokenName } from '@ds/tokens/tokens';

import type { TokenMeta } from './data';
import { sameValue } from './tokenPicker';

export type Suggestion = {
  token: TokenName;
  // The value the code renders today, and the token's.
  from: string;
  to: string;
  // The token's value equals today's: attaching it changes nothing on screen.
  sameLook: boolean;
};

/**
 * Every live token listing `legacyKey`, in the token data's order, each
 * labelled by what it does to the look. `value` is today's value and
 * `resolve` gives a token's live value, both as written (8px, #BDBDBD);
 * colours compare by channel.
 */
export const suggestionsFor = (
  legacyKey: string | undefined,
  value: string,
  meta: TokenMeta[],
  resolve: (token: TokenName) => string
): Suggestion[] => {
  if (!legacyKey) return [];
  return meta
    .filter((t) => !t.deprecated && (t.legacy ?? []).includes(legacyKey))
    .map((t) => {
      const token = t.name as TokenName;
      const to = resolve(token) || t.value;
      return { token, from: value, to, sameLook: sameValue(to, value) };
    });
};

/** "same look", or "changes the look: 8px → 3px". */
export const lookWords = (s: Suggestion) =>
  s.sameLook ? 'same look' : `changes the look: ${s.from} → ${s.to}`;
