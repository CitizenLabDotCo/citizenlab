import React from 'react';

// hooks
import useSteps from './useSteps';

// components
import AuthModal from './AuthModal';

const NewAuthModal = () => {
  const { currentStep, transition, ...rest } = useSteps();

  return (
    <AuthModal currentStep={currentStep} transition={transition} {...rest} />
  );
};

export default NewAuthModal;
