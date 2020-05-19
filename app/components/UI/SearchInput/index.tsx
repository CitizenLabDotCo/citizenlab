import React, { memo, useState, useCallback, useEffect, useMemo, ChangeEvent, MouseEvent, KeyboardEvent } from 'react';
import { isEmpty } from 'lodash-es';
import { LiveMessage } from 'react-aria-live';

// components
import Icon from 'components/UI/Icon';

// utils
import { isPage } from 'utils/helperUtils';

// i18n
import messages from './messages';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';

// styling
import styled from 'styled-components';
import { colors, fontSizes, boxShadowOutline } from 'utils/styleUtils';
import { ScreenReaderOnly } from 'utils/a11y';

const Container = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: ${(props: any) => props.theme.borderRadius};
  border: solid 1px #ececec;
  box-shadow: 0px 2px 2px -1px rgba(152, 162, 179, 0.3), 0px 1px 5px -2px rgba(152, 162, 179, 0.3);
  transition: box-shadow 100ms ease-out;

  &.focused {
    ${boxShadowOutline};
  }
`;

const Input = styled.input`
  flex: 1;
  height: 52px;
  color: ${colors.text};
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  padding: 0px;
  padding-left: 20px;
  margin: 0px;
  background: transparent;
  border: none;
  outline: none;
  -webkit-appearance: none;
  -moz-appearance: none;

  &::-ms-clear {
    display: none;
  }
`;

const SearchIcon = styled(Icon)`
  width: 20px;
  height: 20px;
  fill: ${colors.label};
  margin-left: 10px;
  margin-right: 20px;
`;

const CloseIcon = styled(Icon)`
  width: 14px;
  height: 14px;
  fill: ${colors.label};
`;

const SearchFieldButton = styled.button`
  flex:  0 0 20px;
  width: 20px;
  height: 20px;
  margin-left: 10px;
  margin-right: 20px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  cursor: pointer;

  &:hover {
    ${CloseIcon} {
      fill: #000;
    }
  }
`;

interface Props {
  onChange: (arg: string | null) => void;
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
}

const SearchInput = memo<Props & InjectedIntlProps>(({ onChange, placeholder, ariaLabel, className, intl }) => {

  const adminPage = isPage('admin', location.pathname);

  const [focused, setFocused] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string | null>(null);

  const handleOnChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    const newValue = !isEmpty(event.currentTarget.value) ? event.currentTarget.value : null;
    setSearchTerm(newValue);
  }, []);

  const handleOnFocus = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    setFocused(true);
  }, []);

  const handleOnBlur = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    setFocused(false);
  }, []);

  const handleOnKeyDown = useCallback((event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      setSearchTerm(null);
      setFocused(false);
    }
  }, []);

  const handleOnReset = useCallback((event: MouseEvent<HTMLElement>) => {
    event.preventDefault();
    setSearchTerm(null);
  }, []);

  useEffect(() => {
    // debounce input
    const handler = setTimeout(() => {
      onChange(searchTerm);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  const searchPlaceholder = useMemo(() => {
    return (placeholder || intl.formatMessage(messages.searchPlaceholder));
  }, [placeholder]);

  const searchAriaLabel = useMemo(() => {
    return (ariaLabel || intl.formatMessage(messages.searchAriaLabel));
  }, [ariaLabel]);

  const removeFocus = useCallback((event: MouseEvent<HTMLElement>) => {
    event.preventDefault();
  }, []);

  return (
    <Container className={`${className} ${focused ? 'focused' : 'blurred'} ${adminPage ? 'adminpage' : ''}`}>
      <Input
        type="text"
        aria-label={searchAriaLabel}
        placeholder={searchPlaceholder}
        value={searchTerm || ''}
        onChange={handleOnChange}
        onFocus={handleOnFocus}
        onBlur={handleOnBlur}
        onKeyDown={handleOnKeyDown}
        className="e2e-search-input"
      />
      <ScreenReaderOnly aria-live="polite">
        <FormattedMessage {...messages.searchTerm} values={{ searchTerm }} />
      </ScreenReaderOnly>
      {isEmpty(searchTerm) ?
        <SearchIcon ariaHidden name="search2" />
      :
        <SearchFieldButton
          onMouseDown={removeFocus}
          onClick={handleOnReset}
        >
          <CloseIcon title={intl.formatMessage(messages.removeSearchTerm)} name="close" />
        </SearchFieldButton>
      }
      <LiveMessage
        message={searchTerm ?
          intl.formatMessage(messages.a11y_searchTerm, { searchTerm })
          :
          intl.formatMessage(messages.a11y_searchTermBlank)
        }
        aria-live="polite"
      />
    </Container>
  );
});

export default injectIntl(SearchInput);
