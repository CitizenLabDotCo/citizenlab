import React, { memo, useState, useCallback, useEffect, useMemo, ChangeEvent, MouseEvent, KeyboardEvent } from 'react';
import { isEmpty } from 'lodash-es';

// components
import Icon from 'components/UI/Icon';

// utils
import { isAdminPage } from 'utils/helperUtils';

// i18n
import messages from './messages';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';

// styling
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';
import { transparentize } from 'polished';

const Container = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: ${(props: any) => props.theme.borderRadius};
  border: solid 1px #ececec;
  box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.04);
  transition: box-shadow 100ms ease-out;

  &.focused {
    border-color: ${({ theme }) => theme.colorSecondary};
    box-shadow: 0px 0px 0px 3px ${({ theme }) => transparentize(0.8, theme.colorSecondary)};

    &.adminpage {
      border-color: ${colors.adminTextColor};
      box-shadow: 0px 0px 0px 3px ${transparentize(0.8, colors.adminTextColor)};
    }
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

  &::placeholder {
    color: ${colors.secondaryText};
    font-size: ${fontSizes.base}px;
    font-weight: 400;
    opacity: 1;
  }
`;

const SearchIcon = styled(Icon)`
  width: 20px;
  height: 20px;
  fill: ${colors.label};
`;

const CloseIcon = styled(Icon)`
  width: 14px;
  height: 14px;
  fill: ${colors.label};
`;

const IconWrapper = styled.button`
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

  &.clickable {
    cursor: pointer;

    &:hover {
      ${CloseIcon} {
        fill: #000;
      }
    }
  }
`;

interface Props {
  value: string | null;
  onChange: (arg: string | null) => void;
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
}

const SearchInput = memo<Props & InjectedIntlProps>(({ value, onChange, placeholder, ariaLabel, className, intl }) => {

  const adminPage = isAdminPage(location.pathname);

  const [focused, setFocused] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string | null>(value || null);

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
    if (value !== searchTerm) {
      setSearchTerm(value);
    }
  }, [value]);

  useEffect(() => {
    // debounce input
    const handler = setTimeout(() => {
      if (searchTerm !== value) {
        onChange(searchTerm);
      }
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
      <IconWrapper
        onMouseDown={removeFocus}
        onClick={handleOnReset}
        className={!isEmpty(searchTerm) ? 'clickable' : ''}
      >
        {isEmpty(searchTerm) ? <SearchIcon name="search2" /> : <CloseIcon name="close" />}
      </IconWrapper>
    </Container>
  );
});

export default injectIntl(SearchInput);
