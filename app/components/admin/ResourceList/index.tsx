// Libraries
import * as React from 'react';

// Style
import styled from 'styled-components';
import CSSTransition from 'react-transition-group/CSSTransition';
import TransitionGroup from 'react-transition-group/TransitionGroup';
import { remCalc } from 'utils/styleUtils';

const StyledList = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const timeout = 200;

const StyledRow = styled.div`
  align-items: center !important;
  border-bottom: 1px solid ${props => props.theme.colors.separation};
  color: ${props => props.theme.colors.label};
  display: flex !important;
  font-size: 1rem;
  font-weight: 300;
  justify-content: space-between !important;
  line-height: 20px;
  transition: all ${timeout}ms cubic-bezier(0.165, 0.84, 0.44, 1);

  h1 {
    color: #444;
    font-weight: 500;
    font-size: ${remCalc(18)};
    margin-bottom: ${remCalc(10)};
  }

  p {
    margin-bottom: 0;
  }

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
    color: ${props => props.theme.colors.label};
    font-size: 1rem;
    font-weight: 500;
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
