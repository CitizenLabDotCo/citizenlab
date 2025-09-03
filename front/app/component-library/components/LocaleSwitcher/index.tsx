import React, { PureComponent, MouseEvent } from 'react';

import { isEmpty, get } from 'lodash-es';
import { rgba } from 'polished';
import styled from 'styled-components';

import { colors, fontSizes, isRtl } from '../../utils/styleUtils';
import { MultilocFormValues, Locale } from '../../utils/typings';
import Box from '../Box';

const Container = styled(Box)`
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const StyledButton = styled.button`
  color: ${colors.primary};
  font-size: ${fontSizes.s}px;
  display: flex;
  align-items: center;
  text-transform: uppercase;
  font-weight: 500;
  white-space: nowrap;
  padding: 7px 8px;
  border-radius: ${(props) => props.theme.borderRadius};
  background: ${colors.grey200};
  cursor: pointer;
  transition: all 80ms ease-out;

  ${isRtl`
    flex-direction: row-reverse;
  `}

  &.last {
    margin-right: 0px;
  }

  &:not(.selected):hover {
    color: ${colors.primary};
    background: ${rgba(colors.primary, 0.2)};
  }

  &.selected {
    color: #fff;
    background: ${colors.primary};
  }
`;

const Dot = styled.div`
  flex: 0 0 9px;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: ${colors.red500};
  margin-right: 5px;

  ${isRtl`
    margin-right: 0px;
    margin-left: 5px;
  `}

  &.notEmpty {
    background: ${colors.success};
  }
`;

const isSingleMultilocObjectFilled = (
  locale: Locale,
  values?: MultilocFormValues
) => {
  return Object.getOwnPropertyNames(values).every(
    (key) => !isEmpty(get(values, `[${key}][${locale}]`))
  );
};

export const isValueForLocaleFilled = (
  locale: Locale,
  values?: MultilocFormValues | MultilocFormValues[]
) => {
  if (Array.isArray(values)) {
    return values.every((value) => isSingleMultilocObjectFilled(locale, value));
  }

  return isSingleMultilocObjectFilled(locale, values);
};

interface Props {
  onSelectedLocaleChange: (selectedLocale: Locale) => void;
  locales: Locale[];
  selectedLocale: Locale;
  values?: MultilocFormValues | MultilocFormValues[];
  className?: string;
}

class LocaleSwitcher extends PureComponent<Props> {
  removeFocus = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  handleOnClick =
    (locale: Locale) => (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      if (this.props.selectedLocale !== locale) {
        this.props.onSelectedLocaleChange(locale);
      }
    };

  render() {
    const { locales, selectedLocale, values, className } = this.props;

    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (locales && locales.length > 1) {
      return (
        <Container className={className}>
          {locales.map((locale, index) => (
            <StyledButton
              key={locale}
              onMouseDown={this.removeFocus}
              onClick={this.handleOnClick(locale)}
              type="button"
              className={[
                'e2e-localeswitcher',
                locale,
                locale === selectedLocale ? 'selected' : '',
                index + 1 === locales.length ? 'last' : '',
              ].join(' ')}
            >
              {values && (
                <Dot
                  className={
                    isValueForLocaleFilled(locale, values)
                      ? 'notEmpty'
                      : 'empty'
                  }
                />
              )}
              {locale}
            </StyledButton>
          ))}
        </Container>
      );
    }

    return null;
  }
}

export default LocaleSwitcher;
