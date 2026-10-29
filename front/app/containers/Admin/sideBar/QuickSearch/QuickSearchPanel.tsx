import React, { useCallback, useMemo, useRef, useState } from 'react';

import { Box, SearchInput, Text } from '@citizenlab/cl2-component-library';

import searchInputMessages from 'components/UI/SearchInput/messages';

import { ScreenReaderOnly } from 'utils/a11y';
import { useIntl } from 'utils/cl-intl';

import filterEntries, { QuickSearchEntry } from './filterEntries';
import messages from './messages';
import QuickSearchResult from './QuickSearchResult';
import { getRecentEntries } from './recentPaths';

type Props = {
  entries: QuickSearchEntry[];
  recentPaths: string[];
  currentPath: string | undefined;
  onSelect: () => void;
};

const QuickSearchPanel = ({
  entries,
  recentPaths,
  currentPath,
  onSelect,
}: Props) => {
  const { formatMessage } = useIntl();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const resultRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  const recentEntries = useMemo(
    () => getRecentEntries(recentPaths, entries, currentPath),
    [recentPaths, entries, currentPath]
  );
  // Recent places until the user starts typing.
  const results = query ? filterEntries(entries, query) : recentEntries;

  const handleChange = useCallback((value: string | null) => {
    setQuery(value ?? '');
    setActiveIndex(0);
  }, []);

  const focusInput = useCallback((input: HTMLInputElement | null) => {
    input?.focus();
  }, []);

  const moveActive = (index: number) => {
    setActiveIndex(index);
    resultRefs.current[index]?.scrollIntoView({ block: 'nearest' });
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (results.length === 0) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      moveActive((activeIndex + 1) % results.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      moveActive((activeIndex - 1 + results.length) % results.length);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      // Clicking the link keeps navigation on the typed router Link.
      resultRefs.current[activeIndex]?.click();
    }
  };

  return (
    <Box onKeyDown={handleKeyDown}>
      <SearchInput
        placeholder={formatMessage(messages.placeholder)}
        ariaLabel={formatMessage(messages.placeholder)}
        a11y_closeIconTitle={formatMessage(
          searchInputMessages.removeSearchTerm
        )}
        onChange={handleChange}
        setInputRef={focusInput}
        debounce={100}
        variant="bo"
      />
      <ScreenReaderOnly aria-live="polite">
        {query &&
          formatMessage(messages.resultsCount, { count: results.length })}
      </ScreenReaderOnly>
      {query && results.length === 0 && (
        <Text color="textSecondary" fontSize="s" mt="16px" mb="0px">
          {formatMessage(messages.noResults, { query })}
        </Text>
      )}
      {!query && results.length > 0 && (
        <Text
          id="quick-search-recents"
          color="coolGrey500"
          fontSize="xs"
          px="12px"
          mt="12px"
          mb="0px"
        >
          {formatMessage(messages.recents)}
        </Text>
      )}
      {results.length > 0 && (
        <Box
          role="listbox"
          aria-labelledby={query ? undefined : 'quick-search-recents'}
          mt={query ? '12px' : '4px'}
          maxHeight="60vh"
          overflowY="auto"
        >
          {results.map((entry, index) => (
            <QuickSearchResult
              key={`${entry.group}-${entry.id}`}
              ref={(element) => {
                resultRefs.current[index] = element;
              }}
              entry={entry}
              active={index === activeIndex}
              onSelect={onSelect}
              onHover={() => setActiveIndex(index)}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default QuickSearchPanel;
