import React, { useEffect, useRef, useState } from 'react';

import IconButton from 'design-system/IconButton';
import SearchField from 'design-system/SearchField';

import searchInputMessages from 'components/UI/SearchInput/messages';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import styles from './SearchToggle.module.css';

const DEBOUNCE = 500;
const ANNOUNCEMENT_DELAY = 700;

interface Props {
  searchTerm: string | undefined;
  onChange: (term: string | null) => void;
  resultCount: number;
}

const SearchToggle = ({ searchTerm, onChange, resultCount }: Props) => {
  const { formatMessage } = useIntl();
  const [isOpen, setIsOpen] = useState(!!searchTerm);
  const [appliedTerm, setAppliedTerm] = useState(searchTerm);
  const [inputKey, setInputKey] = useState(0);
  const [announcement, setAnnouncement] = useState('');
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>();

  if (searchTerm !== appliedTerm) {
    setAppliedTerm(searchTerm);
    if (!searchTerm) setInputKey((key) => key + 1);
  }

  useEffect(() => () => clearTimeout(debounceTimer.current), []);

  // Screen readers hear the new result count once the list has settled.
  useEffect(() => {
    const timer = setTimeout(
      () =>
        setAnnouncement(
          formatMessage(searchInputMessages.a11y_projectsAvailable, {
            numberOfProjects: resultCount,
          })
        ),
      ANNOUNCEMENT_DELAY
    );
    return () => clearTimeout(timer);
  }, [resultCount, formatMessage]);

  const handleChange = (value: string) => {
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => onChange(value || null), DEBOUNCE);
  };

  if (!isOpen && !searchTerm) {
    return (
      <IconButton
        variant="bordered"
        icon="search-16"
        aria-label={formatMessage(messages.searchInputs)}
        onPress={() => setIsOpen(true)}
        data-cy="e2e-input-manager-search-toggle"
      />
    );
  }

  return (
    <div className={styles.search}>
      <SearchField
        key={inputKey}
        defaultValue={searchTerm}
        placeholder={formatMessage(messages.searchInputs)}
        aria-label={formatMessage(messages.searchInputs)}
        onChange={handleChange}
        autoFocus
        data-cy="e2e-input-manager-search"
      />
      <span className={styles.announcement} role="status" aria-live="polite">
        {announcement}
      </span>
    </div>
  );
};

export default SearchToggle;
