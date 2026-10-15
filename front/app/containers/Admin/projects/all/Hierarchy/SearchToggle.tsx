import React, {
  FocusEvent,
  KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { Box, SearchInput } from '@citizenlab/cl2-component-library';
import { debounce } from 'lodash-es';

import searchMessages from 'components/UI/SearchInput/messages';

import { useIntl } from 'utils/cl-intl';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';
import { useSearch } from 'utils/router';

import allMessages from '../messages';

import ToolbarButton from './ToolbarButton';

const TYPING_DELAY = 500;

// A search icon that opens into a field. The field stays while there's a
// search; Escape clears it and closes it.
const SearchToggle = () => {
  const { formatMessage } = useIntl();
  const { search } = useSearch({ from: '/$locale/admin/projects/' });
  const [opened, setOpened] = useState(false);
  // Where the focus goes once that element shows: into the field when it
  // opens, back to the icon when Escape closes it. The field can render once
  // more before the URL loses the search, so each element checks it's the one.
  const focusTarget = useRef<'field' | 'icon'>();

  // The field keeps its own text, so a search set elsewhere (opening a level,
  // going back) starts a fresh field showing it. `written` tells those apart
  // from what this field typed.
  const written = useRef(search);
  // Off once Escape closes the field: the field still hands over what was
  // typed just before, a moment later, and that mustn't bring the search back.
  const listening = useRef(true);
  const [fieldKey, setFieldKey] = useState(0);

  useEffect(() => {
    if (search === written.current) return;
    written.current = search;
    listening.current = true;
    setFieldKey((key) => key + 1);
    if (!search) setOpened(false);
  }, [search]);

  // Debounced here rather than in the field, so Escape can drop a search
  // still waiting to be written.
  const writeSearch = useMemo(
    () =>
      debounce((value?: string) => {
        written.current = value;
        updateSearchParams({ search: value });
      }, TYPING_DELAY),
    []
  );
  useEffect(() => () => writeSearch.cancel(), [writeSearch]);

  const handleChange = (value: string | null) => {
    if (!listening.current) return;
    writeSearch(value ?? undefined);
    // Clearing with the field's × applies at once.
    if (value === null) writeSearch.flush();
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Escape') return;
    writeSearch(undefined);
    writeSearch.flush();
    listening.current = false;
    focusTarget.current = 'icon';
    setOpened(false);
  };

  // Leaving an empty field closes it.
  const handleBlur = (event: FocusEvent<HTMLElement>) => {
    const stillInside = event.currentTarget.contains(event.relatedTarget);
    if (!stillInside && !search) setOpened(false);
  };

  const focusWhenShown =
    (target: 'field' | 'icon') => (element: HTMLElement | null) => {
      if (element && focusTarget.current === target) {
        focusTarget.current = undefined;
        element.focus();
      }
    };

  if (!opened && !search) {
    return (
      <ToolbarButton
        ref={focusWhenShown('icon')}
        icon="search"
        label={formatMessage(searchMessages.searchAriaLabel)}
        onClick={() => {
          listening.current = true;
          focusTarget.current = 'field';
          setOpened(true);
        }}
      />
    );
  }

  return (
    <Box width="200px" onKeyDown={handleKeyDown} onBlur={handleBlur}>
      <SearchInput
        key={fieldKey}
        variant="bo"
        size="small"
        defaultValue={search}
        placeholder={formatMessage(allMessages.searchProjects)}
        ariaLabel={formatMessage(allMessages.searchProjects)}
        a11y_closeIconTitle={formatMessage(searchMessages.removeSearchTerm)}
        debounce={0}
        onChange={handleChange}
        setInputRef={focusWhenShown('field')}
      />
    </Box>
  );
};

export default SearchToggle;
