// The token CSS, parsed once: raw definitions, and their values
// without any edit. Foundations and the Tokens panel resolve the session's
// edits over these.
import tokensCss from '@ds/tokens/tokens.css?raw';

import { parseTokenCss, resolveTokens } from './contrast';

export const DEFS = parseTokenCss(tokensCss);
export const BASE = resolveTokens(DEFS);
