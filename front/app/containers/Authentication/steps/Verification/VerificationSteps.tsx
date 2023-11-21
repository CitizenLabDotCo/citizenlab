import React, { memo, useCallback, useState, useEffect } from 'react';

// components
import VerificationMethods from './VerificationMethods';
import Outlet from 'components/Outlet';

// resource hooks
import useAuthUser from 'api/me/useAuthUser';
import useVerificationMethods from 'api/verification_methods/useVerificationMethods';

// style
import styled from 'styled-components';

// typings
import {
  TVerificationMethod,
  verificationTypesLeavingPlatform,
} from 'api/verification_methods/types';
import { TVerificationStep } from 'containers/Authentication/steps/Verification/utils';
import { AuthenticationData } from 'containers/Authentication/typings';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { invalidateQueryCache } from 'utils/cl-react-query/resetQueryCache';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

export interface Props {
  onCompleted?: () => void;
  onError?: () => void;
  authenticationData: AuthenticationData;
}

const VerificationSteps = memo<Props>(
  ({ onCompleted, onError, authenticationData }) => {
    const [activeStep, setActiveStep] =
      useState<TVerificationStep>('method-selection');
    const [method, setMethod] = useState<TVerificationMethod | null>(null);

    const { data: authUser } = useAuthUser();
    const { data: verificationMethods } = useVerificationMethods();

    useEffect(() => {
      if (activeStep === 'success' && onCompleted) {
        onCompleted();
      }

      if (activeStep === 'error' && onError) {
        onError();
      }
    }, [onCompleted, onError, activeStep]);

    const onMethodSelected = (selectedMethod: TVerificationMethod) => {
      // Save the successAction and the current context in local
      // storage for when user returns from verification.
      if (
        verificationTypesLeavingPlatform.includes(
          selectedMethod.attributes.name
        )
      ) {
        if (authenticationData?.successAction) {
          localStorage.setItem(
            'auth_success_action',
            JSON.stringify(authenticationData.successAction)
          );
        }
        if (authenticationData?.context) {
          localStorage.setItem(
            'auth_context',
            JSON.stringify(authenticationData.context)
          );
        }
      }

      setMethod(selectedMethod);
      setActiveStep('method-step');
    };

    const goToSuccessStep = useCallback(() => {
      if (!isNilOrError(authUser)) {
        invalidateQueryCache();
        setActiveStep('success');
        setMethod(null);
      }
    }, [authUser]);

    const onStepCancel = useCallback(() => {
      setActiveStep('method-selection');
      setMethod(null);
    }, []);

    const onStepVerified = useCallback(() => {
      goToSuccessStep();
    }, [goToSuccessStep]);

    if (verificationMethods) {
      return (
        <Container id="e2e-verification-wizard-root">
          {activeStep === 'method-selection' && (
            <VerificationMethods onMethodSelected={onMethodSelected} />
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
  }
);

export default VerificationSteps;
