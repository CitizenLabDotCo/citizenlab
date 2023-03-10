import React, { useState, useEffect } from 'react';

// events
import { triggerAuthenticationFlow$ } from './events';

// hooks
import useSteps from './useSteps';

// components
import { Box, Text } from '@citizenlab/cl2-component-library';
import Centerer from 'components/UI/Centerer';
import Button from 'components/UI/Button';
import AuthModal from './AuthModal';

const NewAuthModal = () => {
  const { currentStep, transition, ...rest } = useSteps();

  const triggerFlow = () => {
    if (currentStep !== 'closed') return;
    transition(currentStep, 'TRIGGER_REGISTRATION_FLOW')();
  };

  return (
    <>
      <Box w="100%" h="100%">
        <Centerer flexDirection="column">
          <Text>Click sign up to start flow</Text>
          {currentStep === 'closed' && (
            <Button width="auto" onClick={triggerFlow}>
              Sign up
            </Button>
          )}
        </Centerer>
      </Box>
      <AuthModal currentStep={currentStep} transition={transition} {...rest} />
    </>
  );
};

export default NewAuthModal;
