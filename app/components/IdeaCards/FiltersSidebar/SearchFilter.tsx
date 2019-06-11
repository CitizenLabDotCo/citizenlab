import React, { memo, useState, useCallback, useEffect, ChangeEvent, MouseEvent, KeyboardEvent } from 'react';
import useDebounce from 'hooks/useDebounce';
import { isEmpty } from 'lodash-es';

// components
import Icon from 'components/UI/Icon';

// i18n
import messages from '../messages';
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

  &.focussed {
    border-color: ${({ theme }) => theme.colorSecondary};
    box-shadow: 0px 0px 0px 3px ${({ theme }) => transparentize(0.8, theme.colorSecondary)};
  }
`;

const Input = styled.input`
  flex: 1;
  height: 59px;
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

const IconWrapper = styled.div`
  flex:  0 0 20px;
  width: 20px;
  height: 20px;
  margin-left: 10px;
  margin-right: 20px;
  display: flex;
  align-items: center;
  justify-content: center;

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
  value?: string | null;
  onChange: (arg: string | null) => void;
  className?: string;
}

const SearchFilter = memo<Props & InjectedIntlProps>(({ value, onChange, className, intl }) => {

  const [focussed, setFocussed] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string | null>(value || null);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const handleOnChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    const newValue = !isEmpty(event.currentTarget.value) ? event.currentTarget.value : null;
    setSearchTerm(newValue);
  }, []);

  const handleOnFocus = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    setFocussed(true);
  }, []);

  const handleOnBlur = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    setFocussed(false);
  }, []);

  const handleOnKeyDown = useCallback((event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      setSearchTerm(null);
      setFocussed(false);
    }
  }, []);

  const handleOnReset = useCallback((event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    setSearchTerm(null);
  }, []);

  useEffect(() => {
    onChange(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  const ariaLabel = intl.formatMessage(messages.searchAriaLabel);
  const placeholder = intl.formatMessage(messages.searchPlaceholder);

  return (
    <Container className={`${className} ${focussed ? 'focussed' : 'blurred'}`}>
      <Input
        type="text"
        aria-label={ariaLabel}
        placeholder={placeholder}
        value={searchTerm || ''}
        onChange={handleOnChange}
        onFocus={handleOnFocus}
        onBlur={handleOnBlur}
        onKeyDown={handleOnKeyDown}
      />
      <IconWrapper onClick={handleOnReset} className={!isEmpty(searchTerm) ? 'clickable' : ''}>
        {isEmpty(searchTerm) ? <SearchIcon name="search2" /> : <CloseIcon name="close3" />}
      </IconWrapper>
    </Container>
  );
});

export default injectIntl(SearchFilter);
