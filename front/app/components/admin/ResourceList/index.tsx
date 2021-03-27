// Libraries
import React, { memo, ReactNode } from 'react';

// Style
import styled from 'styled-components';
import CSSTransition from 'react-transition-group/CSSTransition';
import TransitionGroup from 'react-transition-group/TransitionGroup';
import { remCalc, fontSizes, colors } from 'utils/styleUtils';

// Components
export { default as SortableList } from './SortableList';
export { default as SortableRow } from './SortableRow';

const StyledList = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const timeout = 200;

const Container = styled.div`
  font-size: ${fontSizes.small}px;
  font-weight: 300;
  justify-content: space-between !important;
  line-height: 20px;
  display: flex !important;
  align-items: center !important;
  padding-top: 10px;
  padding-bottom: 10px;
  border-top: 1px solid ${colors.separation};
  transition: all ${timeout}ms cubic-bezier(0.165, 0.84, 0.44, 1);

  &.last-item {
    border-bottom: 1px solid ${colors.separation};
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
    font-size: ${fontSizes.large}px;
  }

  h2 {
    font-size: ${fontSizes.base}px;
  }

  p {
    color: ${colors.label};
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
    color: ${colors.label};
    font-size: ${fontSizes.small}px;
    font-weight: 500;
  }
`;

export const TextCell = styled.div`
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  line-height: 20px;
`;

export const List = memo<{
  id?: string;
  className?: string;
  children: ReactNode;
}>(({ id, className, children }) => (
  <StyledList id={id || ''} className={`e2e-admin-list ${className || ''}`}>
    <TransitionGroup>{children}</TransitionGroup>
  </StyledList>
));

export const Row = memo<{
  id?: string;
  className?: string;
  children: ReactNode;
  isLastItem?: boolean;
}>(({ id, className, children, isLastItem }) => (
  <CSSTransition classNames="list-item" timeout={timeout}>
    <Container
      id={id || ''}
      className={`e2e-admin-list-row ${className || ''} ${
        isLastItem ? 'last-item' : ''
      }`}
    >
      {children}
    </Container>
  </CSSTransition>
));

export const HeadRow = memo<{ className?: string; children: ReactNode }>(
  ({ className, children }) => (
    <Container className={`e2e-admin-list-head-row ${className || ''}`}>
      {children}
    </Container>
  )
);
