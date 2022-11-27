import React, { ReactNode } from 'react';
import CSSTransition from 'react-transition-group/CSSTransition';
import { contentTimeout, contentDelay } from './';

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
      {children}
    </CSSTransition>
  );
};

export default OnboardingStep;
