import React, { useCallback, useRef, useState } from 'react';

import { Box, SearchInput, Text } from '@citizenlab/cl2-component-library';

import searchInputMessages from 'components/UI/SearchInput/messages';

import { ScreenReaderOnly } from 'utils/a11y';
import { useIntl } from 'utils/cl-intl';

import filterEntries, { QuickSearchEntry } from './filterEntries';
import messages from './messages';
import QuickSearchResult from './QuickSearchResult';

type Props = {
  entries: QuickSearchEntry[];
  onSelect: () => void;
};

const QuickSearchPanel = ({ entries, onSelect }: Props) => {
  const { formatMessage } = useIntl();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const resultRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  const results = filterEntries(entries, query);

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
      {results.length > 0 && (
        <Box role="listbox" mt="12px" maxHeight="60vh" overflowY="auto">
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
