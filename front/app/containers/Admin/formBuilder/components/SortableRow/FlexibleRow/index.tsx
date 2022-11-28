// Libraries
import React, { ReactNode } from 'react';

// Style
import styled from 'styled-components';
import CSSTransition from 'react-transition-group/CSSTransition';
import { fontSizes, colors } from 'utils/styleUtils';
import { Box } from '@citizenlab/cl2-component-library';

const timeout = 200;

export const Container = styled.div`
  border-top: 1px solid ${colors.divider};
  transition: all ${timeout}ms cubic-bezier(0.165, 0.84, 0.44, 1);
  &.last-item {
    border-bottom: 1px solid ${colors.divider};
  }
  > * {
    margin-left: 10px;
    margin-right: 10px;
    &:first-child {
      margin-left: 0;
    }
    &:last-child {
      margin-right: 0;
    }
  }
  > .expand {
    flex: 1;
  }
  > .primary {
    font-size: ${fontSizes.base}px;
    font-weight: 400;
    line-height: 20px;
  }
  &.list-item-enter {
    max-height: 0px;
    opacity: 0;
    &.list-item-enter-active {
      max-height: 80px;
      opacity: 1;
    }
  }
  &.list-item-exit {
    max-height: 80px;
    opacity: 1;
    &.list-item-exit-active {
      max-height: 0px;
      opacity: 0;
    }
  }
  &.e2e-admin-list-head-row {
    border-top: 0;
    color: ${colors.textSecondary};
    font-size: ${fontSizes.s}px;
    font-weight: 500;
  }
`;

export const FlexibleRow = ({
  id,
  className,
  children,
  isLastItem,
  rowHeight,
  'data-testid': dataTestId,
}: {
  id?: string;
  className?: string;
  children: ReactNode;
  isLastItem?: boolean;
  rowHeight?: string;
  'data-testid'?: string;
}) => (
  <div data-testid={dataTestId}>
    <CSSTransition classNames="list-item" timeout={timeout}>
      <Container
        id={id}
        className={`e2e-admin-list-row ${className || ''} ${
          isLastItem ? 'last-item' : ''
        }`}
      >
        <Box display="flex" alignContent="center" height={rowHeight}>
          {children}
        </Box>
      </Container>
    </CSSTransition>
  </div>
);
