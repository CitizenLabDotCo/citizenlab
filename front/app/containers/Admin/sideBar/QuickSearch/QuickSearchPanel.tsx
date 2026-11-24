import React, { useCallback, useMemo, useRef, useState } from 'react';

import { Box, SearchInput, Text } from '@citizenlab/cl2-component-library';
import { flushSync } from 'react-dom';

import searchInputMessages from 'components/UI/SearchInput/messages';

import { ScreenReaderOnly } from 'utils/a11y';
import { useIntl } from 'utils/cl-intl';

import filterEntries, { QuickSearchEntry } from './filterEntries';
import messages from './messages';
import QuickSearchResult from './QuickSearchResult';
import { getRecentEntries } from './recents';

const LISTBOX_ID = 'quick-search-results';
const optionId = (index: number) => `quick-search-option-${index}`;

type Props = {
  entries: QuickSearchEntry[];
  recentKeys: string[];
  currentKey: string | undefined;
  onSelect: () => void;
};

const QuickSearchPanel = ({
  entries,
  recentKeys,
  currentKey,
  onSelect,
}: Props) => {
  const { formatMessage } = useIntl();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const resultRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const hasFocusedInput = useRef(false);

  const recentEntries = useMemo(
    () => getRecentEntries(recentKeys, entries, currentKey),
    [recentKeys, entries, currentKey]
  );
  // Recent places until the user starts typing.
  const results = query ? filterEntries(entries, query) : recentEntries;

  const handleChange = useCallback((value: string | null) => {
    setQuery(value ?? '');
    setActiveIndex(0);
  }, []);

  // SearchInput passes us its input again on every render, so focus it only
  // the first time. Otherwise each render (e.g. on blur) pulls focus back from
  // the clear button.
  const setInput = useCallback((input: HTMLInputElement | null) => {
    inputRef.current = input;
    if (input && !hasFocusedInput.current) {
      hasFocusedInput.current = true;
      input.focus();
    }
  }, []);

  const moveActive = (index: number) => {
    setActiveIndex(index);
    resultRefs.current[index]?.scrollIntoView({ block: 'nearest' });
  };

  const selectActive = () => {
    const input = inputRef.current;

    // The search input reports changes after a short delay. If Enter comes
    // first, apply what was typed now, so Enter acts on the matching results.
    if (input && input.value !== query) {
      flushSync(() => handleChange(input.value));
      resultRefs.current[0]?.click();
      return;
    }

    // Clicking the link keeps navigation on the typed router Link.
    resultRefs.current[activeIndex]?.click();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    // Only keys typed in the search input, so Enter on the clear button
    // still clears it.
    if (event.target !== inputRef.current) return;

    if (event.key === 'Enter') {
      event.preventDefault();
      selectActive();
      return;
    }

    if (results.length === 0) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      moveActive((activeIndex + 1) % results.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      moveActive((activeIndex - 1 + results.length) % results.length);
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
        setInputRef={setInput}
        debounce={100}
        variant="bo"
        dataCy="e2e-quick-search-input"
        combobox={{
          listboxId: LISTBOX_ID,
          expanded: results.length > 0,
          activeOptionId:
            activeIndex < results.length ? optionId(activeIndex) : undefined,
        }}
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
          id={LISTBOX_ID}
          data-cy="e2e-quick-search-results"
          role="listbox"
          aria-labelledby={query ? undefined : 'quick-search-recents'}
          mt={query ? '12px' : '4px'}
          maxHeight="60vh"
          overflowY="auto"
        >
          {results.map((entry, index) => (
            <QuickSearchResult
              key={`${entry.group}-${entry.id}`}
              id={optionId(index)}
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
