import React, { useCallback, useState, useEffect } from 'react';

// components
import Modal from 'components/UI/Modal';
import VerificationSuccess from './VerificationSuccess';
import VerificationError from './VerificationError';
import VerificationSteps from './VerificationSteps';

// hooks
import useIsMounted from 'hooks/useIsMounted';
import { useWindowSize } from '@citizenlab/cl2-component-library';

// events
import {
  ContextShape,
  IVerificationError,
  TVerificationStep,
} from 'components/Verification/verificationModalEvents';

import {
  openVerificationModal$,
  closeVerificationModal$,
  closeVerificationModal,
} from './verificationModalEvents';

// style
import styled from 'styled-components';
import { viewportWidths } from 'utils/styleUtils';
import ErrorBoundary from 'components/ErrorBoundary';

// typings
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding-top: 40px;
  padding-bottom: 60px;
  padding-left: 20px;
  padding-right: 20px;
`;

export interface Props {
  className?: string;
  onMounted: (id?: string) => void;
}

const VerificationModal = ({ className, onMounted }: Props) => {
  const { windowWidth } = useWindowSize();

  const isMounted = useIsMounted();
  const [activeStep, setActiveStep] = useState<TVerificationStep>(null);
  const [context, setContext] = useState<ContextShape>(null);
  const [error, setError] = useState<IVerificationError>(null);
  const opened = !!activeStep;

  const smallerThanSmallTablet = windowWidth <= viewportWidths.tablet;

  useEffect(() => {
    if (isMounted() && onMounted) {
      onMounted('verification');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onMounted]);

  useEffect(() => {
    const subscriptions = [
      openVerificationModal$.subscribe(
        ({ eventValue: { step, context, error } }) => {
          setActiveStep(step);
          setContext(context);
          error && setError(error);
        }
      ),
      closeVerificationModal$.subscribe(() => {
        setActiveStep(null);
        setContext(null);
      }),
    ];

    return () =>
      subscriptions.forEach((subscription) => subscription.unsubscribe());
  }, []);

  const onClose = useCallback(() => {
    closeVerificationModal();
  }, []);

  const onCompleted = useCallback(() => {
    setActiveStep('success');
    setContext(null);
  }, []);

  const onError = useCallback(() => {
    setActiveStep('error');
    setContext(null);
  }, []);

  return (
    <ErrorBoundary>
      <Modal
        width={820}
        padding={
          smallerThanSmallTablet ? '0px 5px 0px 5px' : '0px 20px 0px 20px'
        }
        opened={opened}
        close={onClose}
        closeOnClickOutside={false}
      >
        <Container id="e2e-verification-modal" className={className || ''}>
          {activeStep && activeStep !== 'success' && activeStep !== 'error' && (
            <VerificationSteps
              context={context}
              inModal={true}
              showHeader={true}
              initialActiveStep={activeStep}
              onCompleted={onCompleted}
              onError={onError}
            />
          )}

          {activeStep === 'success' && (
            <VerificationSuccess onClose={onClose} />
          )}

          {activeStep === 'error' && <VerificationError error={error} />}
        </Container>
      </Modal>
    </ErrorBoundary>
  );
};

export default VerificationModal;
