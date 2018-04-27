// Libraries
import React from 'react';

// Style
import styled from 'styled-components';
import CSSTransition from 'react-transition-group/CSSTransition';
import TransitionGroup from 'react-transition-group/TransitionGroup';
import { remCalc, fontSize, colors } from 'utils/styleUtils';

// Components
export { default as SortableList } from './SortableList';
export { default as SortableRow } from './SortableRow';

const StyledList = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const timeout = 200;

export const StyledRow = styled.div`
  align-items: center !important;
  border-top: 1px solid ${colors.separation};
  color: ${colors.label};
  display: flex !important;
  font-size: ${fontSize('small')};
  font-weight: 300;
  justify-content: space-between !important;
  line-height: 20px;
  transition: all ${timeout}ms cubic-bezier(0.165, 0.84, 0.44, 1);

  &.last-item {
    border-bottom: 1px solid ${colors.separation};
  }

  h1, h2, h3, h4, h5 {
    color: ${colors.text};
    font-weight: 500;
    margin-bottom: ${remCalc(10)};
  }

  h1 {
    font-size: ${fontSize('large')};
  }

  h2 {
    font-size: ${fontSize('base')};
  }

  p {
    color: ${colors.label};
    font-size: 15px;
    font-weight: 400;
    line-height: 20px;
    margin-bottom: 5px;
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

  > .primary {
    color: ${colors.text};
    font-size: ${fontSize('base')}
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
    color: ${colors.label};
    font-size: ${fontSize('small')};
    font-weight: 500;
  }
`;

export const TextCell = styled.div`
  color: #333;
  font-size: 16px;
  font-weight: 400;
  line-height: 20px;
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
    <StyledRow className={`e2e-admin-list-row ${props['className']} ${props.lastItem && 'last-item'}`}>
      {children}
    </StyledRow>
  </CSSTransition>
);

export const HeadRow = ({ children, ...props }) => (
  <StyledRow className={`e2e-admin-list-head-row ${props['className']}`}>
    {children}
  </StyledRow>
);
