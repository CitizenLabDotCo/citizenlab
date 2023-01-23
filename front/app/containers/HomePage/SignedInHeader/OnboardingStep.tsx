import React, { ReactNode } from 'react';
import CSSTransition from 'react-transition-group/CSSTransition';
import styled from 'styled-components';

const contentTimeout = 350;
const contentEasing = 'cubic-bezier(0.19, 1, 0.22, 1)';
const contentDelay = 550;

const Container = styled.div`
  &.content-enter {
    opacity: 0;

    &.content-enter-active {
      opacity: 1;
      transition: all ${contentTimeout}ms ${contentEasing} ${contentDelay}ms;
    }
  }

  &.content-enter-done {
    opacity: 1;
  }

  &.content-exit {
    opacity: 1;
    transition: all ${contentTimeout}ms ${contentEasing};

    &.content-exit-active {
      opacity: 0;
    }
  }

  &.content-exit-done {
    display: none;
  }
`;

interface Props {
  children: ReactNode;
  isIncomingStep: boolean;
}

const OnboardingStep = ({ children, isIncomingStep }: Props) => {
  return (
    <CSSTransition
      classNames="content"
      in={isIncomingStep}
      timeout={contentTimeout + contentDelay}
      mountOnEnter={true}
      unmountOnExit={true}
      enter={true}
      exit={true}
    >
      <Container>{children}</Container>
    </CSSTransition>
  );
};

export default OnboardingStep;
