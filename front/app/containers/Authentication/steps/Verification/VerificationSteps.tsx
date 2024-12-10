import React, { memo, useCallback, useState, useEffect } from 'react';

import styled from 'styled-components';

import useAuthUser from 'api/me/useAuthUser';
import {
  TVerificationMethod,
  verificationTypesLeavingPlatform,
} from 'api/verification_methods/types';
import useVerificationMethods from 'api/verification_methods/useVerificationMethods';

import { TVerificationStep } from 'containers/Authentication/steps/Verification/utils';
import { AuthenticationData } from 'containers/Authentication/typings';

import Outlet from 'components/Outlet';

// resource hooks
import { invalidateQueryCache } from 'utils/cl-react-query/resetQueryCache';
import { isNilOrError } from 'utils/helperUtils';

import VerificationMethods from './VerificationMethods';
import { RouteType } from 'routes';

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
      // storage for when user returns from verification which leaves platform.
      if (
        verificationTypesLeavingPlatform.includes(
          selectedMethod.attributes.name
        )
      ) {
        localStorage.setItem(
          'auth_context',
          JSON.stringify(authenticationData.context)
        );
        if (authenticationData.successAction) {
          localStorage.setItem(
            'auth_success_action',
            JSON.stringify(authenticationData.successAction)
          );
        }
        localStorage.setItem(
          'auth_path',
          window.location.pathname as RouteType
        );
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
