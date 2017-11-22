// Libraries
import * as React from 'react';

// Style
import styled from 'styled-components';
import CSSTransition from 'react-transition-group/CSSTransition';
import TransitionGroup from 'react-transition-group/TransitionGroup';

const StyledList = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const timeout = 200;

const StyledRow = styled.div`
  color: #444;
  font-size: 16px;
  line-height: 20px;
  font-weight: 400;
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  border-bottom: 1px solid #eaeaea;
  transition: all ${timeout}ms cubic-bezier(0.165, 0.84, 0.44, 1);

  &:first-child {
    border-top: 1px solid #eaeaea;
  }

  > * {
    margin: 1rem;

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
  }
`;

export const List = ({ children, ...props }) => (
  <StyledList className="e2e-admin-list" {...props}>
    <TransitionGroup>
      {children}
    </TransitionGroup>
  </StyledList>
);

export const Row = ({ children, ...props }) => (
  <CSSTransition classNames="list-item" timeout={timeout} {...props}>
    <StyledRow className={`e2e-admin-list-row ${props['className']}`}>
      {children}
    </StyledRow>
  </CSSTransition>
);

export const HeadRow = ({ children, ...props }) => (
  <StyledRow className={`e2e-admin-list-head-row ${props['className']}`}>
    {children}
  </StyledRow>
);
