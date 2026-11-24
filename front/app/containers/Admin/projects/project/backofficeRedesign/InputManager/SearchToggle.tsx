import React, { useEffect, useRef, useState } from 'react';

import IconButton from 'design-system/IconButton';
import SearchField from 'design-system/SearchField';

import searchInputMessages from 'components/UI/SearchInput/messages';

import { ScreenReaderOnly } from 'utils/a11y';
import { useIntl } from 'utils/cl-intl';

import styles from './SearchToggle.module.css';

const DEBOUNCE = 500;
const ANNOUNCEMENT_DELAY = 700;

interface Props {
  label: string;
  searchTerm: string | undefined;
  onChange: (term: string | null) => void;
  resultCount: number;
}

const SearchToggle = ({ label, searchTerm, onChange, resultCount }: Props) => {
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
        aria-label={label}
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
        placeholder={label}
        aria-label={label}
        onChange={handleChange}
        autoFocus
        data-cy="e2e-input-manager-search"
      />
      <ScreenReaderOnly role="status" aria-live="polite">
        {announcement}
      </ScreenReaderOnly>
    </div>
  );
};

export default SearchToggle;
