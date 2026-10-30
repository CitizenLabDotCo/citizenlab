import React from 'react';

import {
  fontSizes,
  isRtl,
  Icon,
  Box,
  Text,
  colors,
  ColorIndicator,
} from '@citizenlab/cl2-component-library';
import { darken } from 'polished';
import styled from 'styled-components';

import { ScreenReaderOnly } from 'utils/a11y';
import { FormattedMessage } from 'utils/cl-intl';
import { removeFocusAfterMouseClick } from 'utils/helperUtils';

import InputFilterCollapsible from './InputFilterCollapsible';
import messages from './messages';
import { scrollToTopIdeasList } from './utils';

const Count = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${fontSizes.base}px;
  font-weight: 300;
  transition: all 80ms ease-out;
  margin-left: auto;
  white-space: nowrap;

  ${isRtl`
    margin-left: 0;
    margin-right: auto;
  `}
`;

const OptionButton = styled.button`
  display: flex;
  cursor: pointer;
  align-items: center;
  justify-content: space-between;

  width: 100%;
  padding: 8px;
  margin-top: 4px;
  border-radius: ${({ theme }) => theme.borderRadius};
  text-align: left;
  word-break: break-word;

  ${isRtl`
    flex-direction: row-reverse;
    text-align: right;
  `}

  &:not(.selected):hover {
    background: ${({ theme }) => theme.colors.grey200};
  }

  &.selected {
    color: #fff;
    background: ${({ theme }) => theme.colors.tenantPrimary};

    &:hover {
      background: ${({ theme }) => darken(0.15, theme.colors.tenantPrimary)};
    }

    ${Count} {
      color: #fff;
    }
  }
`;

export interface FilterOption {
  id: string;
  label: string;
  count: number;
  color?: string;
}

interface Props {
  title: string;
  options: FilterOption[];
  totalCount: number;
  selectedId: string | null | undefined;
  onChange: (id: string | null) => void;
}

const SingleSelectFilter = ({
  title,
  options,
  totalCount,
  selectedId,
  onChange,
}: Props) => {
  const select = (id: string | null) => {
    onChange(id === selectedId ? null : id);
    scrollToTopIdeasList();
  };

  if (options.length === 0) {
    return null;
  }

  const showColors = options.some((option) => option.color);
  const allSelected = !selectedId;

  return (
    <InputFilterCollapsible title={title}>
      <OptionButton
        onMouseDown={removeFocusAfterMouseClick}
        onClick={() => select(null)}
        className={allSelected ? 'selected' : ''}
      >
        <Box display="flex">
          {showColors && <ColorIndicator bgColor={colors.grey500} />}
          <Text m="0px" color={allSelected ? 'white' : 'textPrimary'}>
            <FormattedMessage {...messages.all} />
          </Text>
        </Box>
        <Count aria-hidden>{totalCount}</Count>
        <ScreenReaderOnly>
          <FormattedMessage
            {...messages.a11y_numberOfInputs}
            values={{ inputsCount: totalCount }}
          />
        </ScreenReaderOnly>
        <ScreenReaderOnly aria-live="polite">
          {allSelected && (
            <FormattedMessage
              {...messages.a11y_allSelected}
              values={{ filter: title }}
            />
          )}
        </ScreenReaderOnly>
      </OptionButton>

      <>
        {options.map((option) => {
          const isSelected = option.id === selectedId;

          return (
            <OptionButton
              key={option.id}
              onMouseDown={removeFocusAfterMouseClick}
              onClick={() => select(option.id)}
              className={isSelected ? 'selected' : ''}
            >
              <Box display="flex">
                {showColors && (
                  <ColorIndicator bgColor={option.color ?? colors.grey500} />
                )}
                <Text m="0px" color={isSelected ? 'white' : 'textPrimary'}>
                  {option.label}
                </Text>
              </Box>

              {!isSelected ? (
                <Count aria-hidden>{option.count}</Count>
              ) : (
                <>
                  <Icon fill={colors.white} name="close" />
                  <ScreenReaderOnly>
                    <FormattedMessage {...messages.a11y_removeFilter} />
                  </ScreenReaderOnly>
                </>
              )}

              <ScreenReaderOnly>
                <FormattedMessage
                  {...messages.a11y_numberOfInputs}
                  values={{ inputsCount: option.count }}
                />
              </ScreenReaderOnly>
              <ScreenReaderOnly aria-live="polite">
                {isSelected && (
                  <FormattedMessage
                    {...messages.a11y_selectedOption}
                    values={{ filter: title, option: option.label }}
                  />
                )}
              </ScreenReaderOnly>
            </OptionButton>
          );
        })}
      </>
    </InputFilterCollapsible>
  );
};

export default SingleSelectFilter;
