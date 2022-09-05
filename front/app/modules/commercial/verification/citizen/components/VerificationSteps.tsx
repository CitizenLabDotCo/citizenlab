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
import { media } from 'utils/styleUtils';

// typings
import { TVerificationMethod } from 'services/verificationMethods';
import { isNilOrError } from 'utils/helperUtils';
import {
  ContextShape,
  IVerificationError,
  TVerificationStep,
} from 'components/Verification/verificationModalEvents';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding-bottom: 30px;

  ${media.smallerThanMinTablet`
    padding-bottom: 20px;
  `}
`;

export interface Props {
  context: ContextShape; // TODO change to pass in additionnal rules info
  initialActiveStep: TVerificationStep;
  showHeader?: boolean;
  inModal: boolean;
  skippable?: boolean;
  onCompleted?: () => void;
  onSkipped?: () => void;
  onError?: () => void;
  className?: string;
  error?: IVerificationError | null | undefined;
}

const VerificationSteps = memo<Props>(
  ({
    className,
    context,
    initialActiveStep,
    showHeader,
    inModal,
    skippable,
    onCompleted,
    onSkipped,
    onError,
    error,
  }) => {
    const [activeStep, setActiveStep] = useState<TVerificationStep>(
      initialActiveStep || 'method-selection'
    );
    const [method, setMethod] = useState<TVerificationMethod | null>(null);

    const authUser = useAuthUser();
    const verificationMethods = useVerificationMethods();

    useEffect(() => {
      if (activeStep === 'success' && onCompleted) {
        onCompleted();
      }

      if (activeStep === 'error' && (context === null || error) && onError) {
        onError();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [onCompleted, onError, context, activeStep]);

    const onMethodSelected = (selectedMethod: TVerificationMethod) => {
      setMethod(selectedMethod);
      setActiveStep('method-step');
    };

    const goToSuccessStep = useCallback(() => {
      if (!isNilOrError(authUser)) {
        streams.reset().then(() => {
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

    const onVerificationSkipped = useCallback(() => {
      onSkipped?.();
    }, [onSkipped]);

    if (!isNilOrError(verificationMethods)) {
      return (
        <Container
          id="e2e-verification-wizard-root"
          className={className || ''}
        >
          {activeStep === 'method-selection' && (
            <VerificationMethods
              context={context}
              showHeader={showHeader}
              inModal={inModal}
              skippable={skippable}
              onSkipped={onVerificationSkipped}
              onMethodSelected={onMethodSelected}
            />
          )}

          <Outlet
            id="app.components.VerificationModal.methodSteps"
            method={method}
            showHeader={showHeader}
            inModal={inModal}
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
