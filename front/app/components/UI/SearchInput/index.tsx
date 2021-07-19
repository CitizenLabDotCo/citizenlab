import React, { memo, useCallback, useState } from 'react';
import { SearchInput, SearchInputProps } from 'cl2-component-library';
import messages from './messages';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';

export interface Props {
  placeholder?: string;
  ariaLabel?: string;
  debounce?: number;
  setClearButtonRef?: (arg: HTMLButtonElement) => void;
  onChange: (arg: string | null) => void;
  className?: string;
  size?: SearchInputProps['size'];
}

const SearchInputWrapper = memo<Props & InjectedIntlProps>(
  ({
    placeholder,
    ariaLabel,
    debounce,
    setClearButtonRef,
    onChange,
    className,
    size,
    intl: { formatMessage },
  }) => {
    const [searchTerm, setSearchTerm] = useState<string | null>(null);

    const handleOnChange = useCallback(
      (searchTerm: string | null) => {
        setSearchTerm(searchTerm);
        onChange(searchTerm);
      },
      [onChange]
    );

    const handleClearButtonRef = useCallback(
      (element: HTMLButtonElement) => {
        setClearButtonRef?.(element);
      },
      [setClearButtonRef]
    );

    return (
      <SearchInput
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
    );
  }
);

const SearchInputWrapperWithHoC = injectIntl(SearchInputWrapper);

export default SearchInputWrapperWithHoC;
