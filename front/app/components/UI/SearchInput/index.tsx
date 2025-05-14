import React from 'react';

import {
  SearchInput,
  SearchInputProps,
} from '@citizenlab/cl2-component-library';
import { WrappedComponentProps } from 'react-intl';

import { ScreenReaderOnly } from 'utils/a11y';
import { injectIntl } from 'utils/cl-intl';

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
  setInputRef?: (ref: HTMLInputElement | null) => void;
}

const SearchInputWrapper = ({
  defaultValue,
  placeholder,
  ariaLabel,
  debounce,
  onChange,
  className,
  size,
  intl: { formatMessage },
  a11y_numberOfSearchResults,
  setInputRef,
  labelColor,
}: Props & WrappedComponentProps) => (
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
    />
    <ScreenReaderOnly aria-live="assertive">
      {formatMessage(messages.a11y_searchResultsHaveChanged1, {
        numberOfSearchResults: a11y_numberOfSearchResults,
      })}
    </ScreenReaderOnly>
  </>
);

export default injectIntl(SearchInputWrapper);
