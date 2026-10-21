import { useCallback } from 'react';

import { BlockMessages } from 'api/custom_blocks/types';

import useLocale from 'hooks/useLocale';

/**
 * Builds the `msg()` a block receives: its own catalogue, for the reader's locale.
 *
 * Falls back to any locale that defines the key rather than rendering the key
 * itself. A composed report is written in one locale, so a reader in another
 * language would otherwise see `title` where a chart heading belongs.
 */
const useBlockMessages = (messages: BlockMessages | undefined) => {
  const locale = useLocale();

  return useCallback(
    (key: string): string => {
      const forLocale = messages?.[locale]?.[key];
      if (forLocale !== undefined) return forLocale;

      for (const catalog of Object.values(messages ?? {})) {
        if (key in catalog) return catalog[key];
      }

      return key;
    },
    [messages, locale]
  );
};

export default useBlockMessages;
