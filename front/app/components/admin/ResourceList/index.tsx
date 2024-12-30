import React, { ReactNode } from 'react';

import { remCalc, fontSizes, colors } from '@citizenlab/cl2-component-library';
import CSSTransition from 'react-transition-group/CSSTransition';
import TransitionGroup from 'react-transition-group/TransitionGroup';
import styled from 'styled-components';

const StyledList = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const timeout = 200;

export const Container = styled.div<{ disableNestedStyles?: boolean }>`
  font-size: ${fontSizes.s}px;
  font-weight: 300;
  justify-content: space-between !important;
  line-height: 20px;
  display: flex !important;
  align-items: center !important;
  padding-top: 10px;
  padding-bottom: 10px;
  border-top: 1px solid ${colors.divider};
  transition: all ${timeout}ms cubic-bezier(0.165, 0.84, 0.44, 1);

  ${({ disableNestedStyles }) =>
    disableNestedStyles
      ? ''
      : `
  &.last-item {
    border-bottom: 1px solid ${colors.divider};
  }
  h1,
  h2,
  h3,
  h4,
  h5 {
    font-weight: 500;
    margin-bottom: ${remCalc(10)};
  }
  h1 {
    font-size: ${fontSizes.l}px;
  }
  h2 {
    font-size: ${fontSizes.base}px;
  }
  p {
    color: ${colors.textSecondary};
    font-size: ${fontSizes.base}px;
    font-weight: 400;
    line-height: 20px;
    margin-bottom: 5px;
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
  `}
`;

export const TextCell = styled.div`
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  line-height: 20px;
`;

export const List = ({
  id,
  className,
  children,
}: {
  id?: string;
  className?: string;
  children: ReactNode;
}) => (
  <StyledList id={id} className={`e2e-admin-list ${className || ''}`}>
    <TransitionGroup>
      <>{children}</>
    </TransitionGroup>
  </StyledList>
);

export const Row = ({
  id,
  className,
  children,
  isLastItem,
  'data-testid': dataTestId,
  disableNestedStyles,
}: {
  id?: string;
  className?: string;
  children: ReactNode;
  isLastItem?: boolean;
  'data-testid'?: string;
  disableNestedStyles?: boolean;
}) => (
  <div data-testid={dataTestId}>
    <CSSTransition classNames="list-item" timeout={timeout}>
      <Container
        id={id}
        className={`e2e-admin-list-row ${className || ''} ${
          isLastItem ? 'last-item' : ''
        }`}
        disableNestedStyles={disableNestedStyles}
      >
        {children}
      </Container>
    </CSSTransition>
  </div>
);

export const HeadRow = ({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) => (
  <Container className={`e2e-admin-list-head-row ${className || ''}`}>
    {children}
  </Container>
);
