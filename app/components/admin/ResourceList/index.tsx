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

const StyledRow = styled.div`
  align-items: center;
  border-bottom: 1px solid #EAEAEA;
  display: flex;
  justify-content: space-between;
  transition: max-height 400ms cubic-bezier(0.165, 0.84, 0.44, 1),
  opacity 400ms cubic-bezier(0.165, 0.84, 0.44, 1);

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
    opacity: 0.01;

    &.list-item-enter-active {
      max-height: 60px;
      opacity: 1;
    }
  }

  &.list-item-exit {
    max-height: 100px;
    opacity: 1;

    &.list-item-exit-active {
      max-height: 0px;
      opacity: 0.01;
    }
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
  <CSSTransition classNames="list-item" timeout={400} {...props}>
    <StyledRow className="e2e-admin-list-row">
      {children}
    </StyledRow>
  </CSSTransition>
);
