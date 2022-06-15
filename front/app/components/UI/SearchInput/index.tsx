import React from 'react';
import {
  SearchInput,
  SearchInputProps,
  Label,
} from '@citizenlab/cl2-component-library';
import messages from './messages';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import { ScreenReaderOnly } from 'utils/a11y';

export interface Props {
  placeholder?: string;
  ariaLabel?: string;
  debounce?: number;
  setClearButtonRef?: (arg: HTMLButtonElement) => void;
  onChange: (arg: string | null) => void;
  className?: string;
  size?: SearchInputProps['size'];
  // This prop will ensure that screen readers
  // get notified when the number of results have changed.
  a11y_numberOfSearchResults: number;
}

const SearchInputWrapper = ({
  placeholder,
  ariaLabel,
  debounce,
  setClearButtonRef,
  onChange,
  className,
  size,
  intl: { formatMessage },
  a11y_numberOfSearchResults,
}: Props & InjectedIntlProps) => {
  const handleOnChange = (searchTerm: string | null) => {
    onChange(searchTerm);
  };

  const handleClearButtonRef = (element: HTMLButtonElement) => {
    setClearButtonRef?.(element);
  };

  return (
    <>
      <Label htmlFor="search-input" hidden>
        {formatMessage(messages.searchLabel)}
      </Label>
      <SearchInput
        id="search-input"
        placeholder={placeholder || formatMessage(messages.searchPlaceholder)}
        ariaLabel={ariaLabel || formatMessage(messages.searchAriaLabel)}
        debounce={debounce}
        className={className}
        setClearButtonRef={handleClearButtonRef}
        onChange={handleOnChange}
        a11y_RemoveSearchTermMessage={formatMessage(messages.removeSearchTerm)}
        size={size}
      />
      <ScreenReaderOnly aria-live="assertive">
        {formatMessage(messages.a11y_searchResultsHaveChanged, {
          numberOfSearchResults: a11y_numberOfSearchResults,
        })}
      </ScreenReaderOnly>
    </>
  );
};

export default injectIntl(SearchInputWrapper);
