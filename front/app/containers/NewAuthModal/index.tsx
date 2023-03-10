import React, { useState, useEffect, useCallback } from 'react';

// events
import { triggerAuthenticationFlow$ } from './events';

// hooks
import useSteps from './useSteps';

// components
import AuthModal from './AuthModal';

// types
import { AuthenticationContext } from 'api/permissions/types';

interface Props {
  authenticationContext: AuthenticationContext;
  endAuthenticationFlow: () => void;
}

const NewAuthModal = ({
  authenticationContext,
  endAuthenticationFlow,
}: Props) => {
  const { currentStep, transition, ...rest } = useSteps(
    authenticationContext,
    endAuthenticationFlow
  );

  return (
    <AuthModal currentStep={currentStep} transition={transition} {...rest} />
  );
};

const NewAuthModalWrapper = () => {
  const [authenticationContext, setAuthenticationContext] =
    useState<AuthenticationContext | null>(null);

  useEffect(() => {
    triggerAuthenticationFlow$.subscribe((event) => {
      setAuthenticationContext(event.eventValue);
    });
  }, []);

  const endAuthenticationFlow = useCallback(() => {
    setAuthenticationContext(null);
  }, []);

  if (!authenticationContext) return null;

  return (
    <NewAuthModal
      authenticationContext={authenticationContext}
      endAuthenticationFlow={endAuthenticationFlow}
    />
  );
};

export default NewAuthModalWrapper;
