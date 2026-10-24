// The token source the shell diffs against: bundled, or in a local run
// the file as it is now (saved edits change it after the build).
import tokensSource from '@ds/tokens/tokens.source.json';

let source: unknown = tokensSource;
export const tokenSource = () => source;
export const setTokenSource = (next: unknown) => {
  source = next;
};
