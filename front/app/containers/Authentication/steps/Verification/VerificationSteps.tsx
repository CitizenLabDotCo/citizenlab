import React, { memo, useCallback, useState, useEffect } from 'react';
import streams from 'utils/streams';

// components
import VerificationMethods from './VerificationMethods';
import Outlet from 'components/Outlet';

// resource hooks
import useAuthUser from 'hooks/useAuthUser';
import useVerificationMethods from 'hooks/useVerificationMethods';

// style
import styled from 'styled-components';

// typings
import { TVerificationMethod } from 'services/verificationMethods';
import { isNilOrError } from 'utils/helperUtils';
import { TVerificationStep } from 'containers/Authentication/steps/Verification/utils';
import { AuthenticationContext } from 'api/authentication/authentication_requirements/types';

import { resetQueryCache } from 'utils/cl-react-query/resetQueryCache';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

export interface Props {
  context: AuthenticationContext | null;
  onCompleted?: () => void;
  onError?: () => void;
}

const VerificationSteps = memo<Props>(({ context, onCompleted, onError }) => {
  const [activeStep, setActiveStep] =
    useState<TVerificationStep>('method-selection');
  const [method, setMethod] = useState<TVerificationMethod | null>(null);

  const authUser = useAuthUser();
  const verificationMethods = useVerificationMethods();

  useEffect(() => {
    if (activeStep === 'success' && onCompleted) {
      onCompleted();
    }

    if (activeStep === 'error' && context === null && onError) {
      onError();
    }
  }, [onCompleted, onError, context, activeStep]);

  const onMethodSelected = (selectedMethod: TVerificationMethod) => {
    setMethod(selectedMethod);
    setActiveStep('method-step');
  };

  const goToSuccessStep = useCallback(() => {
    if (!isNilOrError(authUser)) {
      streams.reset().then(async () => {
        await resetQueryCache();
        setActiveStep('success');
        setMethod(null);
      });
    }
  }, [authUser]);

  const onStepCancel = useCallback(() => {
    setActiveStep('method-selection');
    setMethod(null);
  }, []);

  const onStepVerified = useCallback(() => {
    goToSuccessStep();
  }, [goToSuccessStep]);

  if (!isNilOrError(verificationMethods)) {
    return (
      <Container id="e2e-verification-wizard-root">
        {activeStep === 'method-selection' && (
          <VerificationMethods
            context={context}
            onMethodSelected={onMethodSelected}
          />
        )}

        <Outlet
          id="app.components.VerificationModal.methodSteps"
          method={method}
          onCancel={onStepCancel}
          onVerified={onStepVerified}
          activeStep={activeStep}
        />
      </Container>
    );
  }

  return null;
});

export default VerificationSteps;
