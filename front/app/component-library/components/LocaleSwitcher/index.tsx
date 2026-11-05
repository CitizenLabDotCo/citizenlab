import React, { PureComponent, MouseEvent } from 'react';

import { isEmpty, get } from 'lodash-es';
import { rgba } from 'polished';
import styled, { css } from 'styled-components';

import { bo, colors, fontSizes, isRtl } from '../../utils/styleUtils';
import { MultilocFormValues, Locale } from '../../utils/typings';
import Box from '../Box';

type Variant = 'default' | 'bo';

const Container = styled(Box)<{ variant: Variant }>`
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  gap: ${({ variant }) => (variant === 'bo' ? '4px' : '6px')};
`;

const boButtonStyle = css`
  height: 26px;
  padding: 0 12px 0 10px;
  border-radius: ${bo.borderRadius};
  background: ${colors.grey100};
  color: ${bo.colors.textHeading};
  font-size: ${fontSizes.xs}px;
  font-weight: 400;
  line-height: 1;

  &:not(.selected):hover {
    color: ${bo.colors.textHeading};
    background: ${colors.grey200};
  }

  &.selected {
    background: ${colors.teal500};
  }
`;

const StyledButton = styled.button<{ variant: Variant }>`
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

  ${({ variant }) => variant === 'bo' && boButtonStyle}
`;

const boDotStyle = css`
  flex: 0 0 6px;
  width: 6px;
  height: 6px;
`;

const Dot = styled.div<{ variant: Variant }>`
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

  /* A machine translation: filled for one half. */
  &.machine {
    background: linear-gradient(
      90deg,
      ${colors.success} 50%,
      ${colors.white} 50%
    );
    box-shadow: 0 0 0 1px ${colors.success};
  }

  /* A machine translation of an older version of the source text. */
  &.stale {
    background: linear-gradient(
      90deg,
      ${colors.orange500} 50%,
      ${colors.white} 50%
    );
    box-shadow: 0 0 0 1px ${colors.orange500};
  }

  ${({ variant }) => variant === 'bo' && boDotStyle}
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

// Extra state of a filled locale, shown with a different dot.
export type LocaleState = 'machine' | 'stale';

interface Props {
  onSelectedLocaleChange: (selectedLocale: Locale) => void;
  locales: Locale[];
  selectedLocale: Locale;
  values?: MultilocFormValues | MultilocFormValues[];
  className?: string;
  variant?: Variant;
  localeStates?: Partial<Record<Locale, LocaleState>>;
  // Accessible names of the locale states, e.g. "machine translation".
  localeStateLabels?: Partial<Record<LocaleState, string>>;
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
    const {
      locales,
      selectedLocale,
      values,
      className,
      variant = 'default',
      localeStates,
      localeStateLabels,
    } = this.props;

    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (locales && locales.length > 1) {
      return (
        <Container className={className} variant={variant}>
          {locales.map((locale, index) => {
            const localeState = localeStates?.[locale];
            const localeStateLabel = localeState
              ? localeStateLabels?.[localeState]
              : undefined;

            return (
              <StyledButton
                key={locale}
                onMouseDown={this.removeFocus}
                onClick={this.handleOnClick(locale)}
                type="button"
                variant={variant}
                className={[
                  'e2e-localeswitcher',
                  locale,
                  locale === selectedLocale ? 'selected' : '',
                  index + 1 === locales.length ? 'last' : '',
                ].join(' ')}
                title={
                  localeStateLabel
                    ? `${locale}: ${localeStateLabel}`
                    : undefined
                }
              >
                {values && (
                  <Dot
                    variant={variant}
                    className={[
                      isValueForLocaleFilled(locale, values)
                        ? 'notEmpty'
                        : 'empty',
                      localeState ?? '',
                    ].join(' ')}
                  />
                )}
                {locale}
              </StyledButton>
            );
          })}
        </Container>
      );
    }

    return null;
  }
}

export default LocaleSwitcher;
