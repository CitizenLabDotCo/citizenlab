import React from 'react';

import {
  Icon,
  Box,
  colors,
  fontSizes,
} from '@citizenlab/cl2-component-library';
import { rgba } from 'polished';
import styled from 'styled-components';

import { useIntl } from 'utils/cl-intl';
import { removeFocusAfterMouseClick } from 'utils/helperUtils';

import messages from './messages';

const ContainerInner = styled.div`
  display: flex;
  align-items: center;
`;

const ChevronIcon = styled(Icon)`
  fill: ${colors.primary};
`;

const NavigateButton = styled.button`
  width: 38px;
  height: 38px;
  color: ${colors.primary};
  font-size: ${fontSizes.base}px;
  font-weight: 500;
  margin: 0;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${(props) => props.theme.borderRadius};

  &.disabled {
    color: #bbb;
    cursor: not-allowed;

    ${ChevronIcon} {
      fill: #bbb;
    }
  }

  &:not(.disabled) {
    cursor: pointer;

    &:hover,
    &:focus {
      ${ChevronIcon} {
        fill: ${colors.teal400};
      }
    }
  }
`;

const Next = styled(NavigateButton)``;

const Back = styled(NavigateButton)`
  ${ChevronIcon} {
    transform: rotate(180deg);
  }
`;

const Pages = styled.div`
  margin-left: 14px;
  margin-right: 14px;
  display: flex;
  align-items: center;
`;

const Item = styled.button<{ useColorsTheme?: boolean }>`
  min-width: 38px;
  height: 38px;
  color: ${({ useColorsTheme, theme }) =>
    useColorsTheme ? theme.colors.tenantText : colors.primary};
  font-size: ${fontSizes.base}px;
  font-weight: 500;
  margin-left: 5px;
  padding-left: 10px;
  padding-right: 10px;
  transition: all 80ms ease-out;

  &:first-child {
    margin-left: 0px;
  }

  &:not(.disabled) {
    border-radius: ${(props) => props.theme.borderRadius};
    background: ${colors.grey200};
    cursor: pointer;

    &.active {
      color: #fff;
      background: ${({ useColorsTheme, theme }) =>
        useColorsTheme ? theme.colors.tenantPrimary : colors.primary};
    }

    &:not(.active) {
      &:hover,
      &:focus {
        background: ${({ useColorsTheme, theme }) =>
          rgba(
            useColorsTheme ? theme.colors.tenantPrimary : colors.primary,
            0.2
          )};
      }
    }
  }
`;

export interface Props {
  currentPage: number;
  totalPages: number;
  loadPage: (page: number) => void;
  className?: string;
  useColorsTheme?: boolean;
}

const Pagination = ({
  currentPage,
  totalPages,
  className,
  useColorsTheme,
  loadPage,
}: Props) => {
  if (totalPages > 1) {
    return (
      <Box
        display="flex"
        justifyContent="flex-end"
        className={className}
        data-testid="pagination"
      >
        <PaginationWithoutPositioning
          currentPage={currentPage}
          totalPages={totalPages}
          useColorsTheme={useColorsTheme}
          loadPage={loadPage}
        />
      </Box>
    );
  }

  return null;
};

export const PaginationWithoutPositioning = ({
  currentPage,
  totalPages,
  useColorsTheme,
  loadPage,
}: Props) => {
  const { formatMessage } = useIntl();
  const calculateMenuItems = (currentPage: number, totalPages: number) => {
    const current = currentPage;
    const last = totalPages;
    const delta = 2;
    const left = current - delta;
    const right = current + delta + 1;
    const range: number[] = [];
    const rangeWithDots: number[] = [];
    let l: number;

    for (let i = 1; i <= last; i += 1) {
      if (i === 1 || i === last || (i >= left && i < right)) {
        range.push(i);
      }
    }

    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push(-i);
        }
      }

      rangeWithDots.push(i);

      l = i;
    });

    return rangeWithDots;
  };

  const handleItemClick = (item: number) => () => {
    loadPage(item);
  };

  const goTo = (page: number) => () => {
    if (page > 0 && page <= totalPages) {
      loadPage(page);
    }
  };

  const pageItems = calculateMenuItems(currentPage, totalPages);

  return (
    <ContainerInner>
      <Back
        onMouseDown={removeFocusAfterMouseClick}
        onClick={goTo(currentPage - 1)}
        disabled={currentPage === 1}
        className={currentPage === 1 ? 'disabled' : ''}
        aria-label={formatMessage(messages.back)}
      >
        <ChevronIcon name="chevron-right" />
      </Back>

      <Pages>
        {pageItems.map((item) => (
          <Item
            key={item}
            className={`${item === currentPage ? 'active' : ''} ${
              item < 0 ? 'disabled' : ''
            }`}
            onMouseDown={removeFocusAfterMouseClick}
            onClick={handleItemClick(item)}
            disabled={item < 0}
            useColorsTheme={useColorsTheme}
          >
            <span>{item < 0 ? '...' : item.toString()}</span>
          </Item>
        ))}
      </Pages>

      <Next
        onMouseDown={removeFocusAfterMouseClick}
        onClick={goTo(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={currentPage === totalPages ? 'disabled' : ''}
        aria-label={formatMessage(messages.next)}
      >
        <ChevronIcon name="chevron-right" />
      </Next>
    </ContainerInner>
  );
};

export default Pagination;
