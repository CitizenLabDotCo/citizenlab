import React, { useState } from 'react';
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
  numberOfSearchResults?: number;
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
  numberOfSearchResults,
}: Props & InjectedIntlProps) => {
  const [searchTerm, setSearchTerm] = useState<string | null>(null);

  const handleOnChange = (searchTerm: string | null) => {
    setSearchTerm(searchTerm);
    onChange(searchTerm);
  };

  const handleClearButtonRef = (element: HTMLButtonElement) => {
    setClearButtonRef?.(element);
  };

  return (
    <>
      <ScreenReaderOnly aria-live="assertive">
        {formatMessage(messages.a11y_searchResultsHaveChanged, {
          numberOfSearchResults,
        })}
      </ScreenReaderOnly>
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
        i18nRemoveSearchTermMessage={formatMessage(messages.removeSearchTerm)}
        i18nSearchTermMessage={formatMessage(messages.a11y_searchTerm, {
          searchTerm,
        })}
        i18nSearchTermBlankMessage={formatMessage(
          messages.a11y_searchTermBlank
        )}
        size={size}
      />
    </>
  );
};

export default injectIntl(SearchInputWrapper);
