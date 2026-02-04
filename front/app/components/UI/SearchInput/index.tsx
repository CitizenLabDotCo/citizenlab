import React, { useEffect, useState } from 'react';

import {
  SearchInput,
  SearchInputProps,
} from '@citizenlab/cl2-component-library';

import { ScreenReaderOnly } from 'utils/a11y';
import { useIntl } from 'utils/cl-intl';

import messages from './messages';

export interface Props {
  defaultValue?: string;
  placeholder?: string;
  ariaLabel?: string;
  debounce?: number;
  onChange: (arg: string | null) => void;
  className?: string;
  size?: SearchInputProps['size'];
  labelColor?: string;
  // This prop will ensure that screen readers
  // get notified when the number of results have changed.
  a11y_numberOfSearchResults: number;
  a11y_searchQuery?: string | null;
  a11y_filtersAppliedCount?: number;
  setInputRef?: (ref: HTMLInputElement | null) => void;
  hideLabel?: boolean;
  dataCy?: string;
}

const SearchInputWrapper = ({
  defaultValue,
  placeholder,
  ariaLabel,
  debounce,
  onChange,
  className,
  size,
  a11y_numberOfSearchResults,
  setInputRef,
  labelColor,
  hideLabel,
  dataCy,
  a11y_searchQuery,
  a11y_filtersAppliedCount,
}: Props) => {
  const { formatMessage } = useIntl();
  const [announcement, setAnnouncement] = useState('');
  useEffect(() => {
    const announcementParts: string[] = [];

    announcementParts.push(
      formatMessage(messages.a11y_projectsAvailable, {
        numberOfProjects: a11y_numberOfSearchResults,
      })
    );

    if (a11y_searchQuery?.trim()) {
      announcementParts.push(
        formatMessage(messages.a11y_searchQuery, {
          searchTerm: a11y_searchQuery.trim(),
        })
      );
    }

    if (a11y_filtersAppliedCount) {
      announcementParts.push(
        formatMessage(messages.a11y_filtersAppliedCount, {
          numberOfFilters: a11y_filtersAppliedCount,
        })
      );
    }

    setAnnouncement(announcementParts.join(' '));
  }, [
    a11y_numberOfSearchResults,
    a11y_searchQuery,
    a11y_filtersAppliedCount,
    formatMessage,
  ]);

  return (
    <>
      <SearchInput
        defaultValue={defaultValue}
        id="search-input"
        placeholder={placeholder || formatMessage(messages.searchPlaceholder)}
        ariaLabel={ariaLabel || formatMessage(messages.searchAriaLabel)}
        debounce={debounce}
        className={className}
        onChange={onChange}
        a11y_closeIconTitle={formatMessage(messages.removeSearchTerm)}
        size={size}
        setInputRef={setInputRef}
        labelColor={labelColor}
        hideLabel={hideLabel}
        dataCy={dataCy}
      />
      <ScreenReaderOnly aria-live="polite">{announcement}</ScreenReaderOnly>
    </>
  );
};

export default SearchInputWrapper;
