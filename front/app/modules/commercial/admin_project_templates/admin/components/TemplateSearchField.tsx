import React, { useEffect, useRef, useState } from 'react';

import searchInputMessages from 'components/UI/SearchInput/messages';

import SearchField from 'design-system/SearchField';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import styles from './TemplateSearchField.module.css';

// The same delays the old search input used.
const DEBOUNCE = 500;
const ANNOUNCEMENT_DELAY = 700;

interface Props {
  onChange: (searchValue: string) => void;
  resultCount: number;
}

const TemplateSearchField = ({ onChange, resultCount }: Props) => {
  const { formatMessage } = useIntl();
  const [announcement, setAnnouncement] = useState('');
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>();

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
    debounceTimer.current = setTimeout(() => onChange(value), DEBOUNCE);
  };

  return (
    <div className={styles.search}>
      <SearchField
        placeholder={formatMessage(messages.searchPlaceholder)}
        aria-label={formatMessage(messages.searchPlaceholder)}
        onChange={handleChange}
      />
      <span className={styles.announcement} role="status" aria-live="polite">
        {announcement}
      </span>
    </div>
  );
};

export default TemplateSearchField;
