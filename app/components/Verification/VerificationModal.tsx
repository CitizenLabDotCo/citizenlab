import React, { memo, useCallback, useState, useEffect } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import Modal from 'components/UI/Modal';
import VerificationSuccess from './VerificationSuccess';
import VerificationError from './VerificationError';
import VerificationSteps from './VerificationSteps';

// hooks
import useIsMounted from 'hooks/useIsMounted';
import useAuthUser from 'hooks/useAuthUser';

// events
import { openVerificationModal$, closeVerificationModal$, closeVerificationModal } from 'components/Verification/verificationModalEvents';

// style
import styled from 'styled-components';

// typings
import { IVerificationMethod } from 'services/verificationMethods';
import { IParticipationContextType, ICitizenAction } from 'typings';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

export type ProjectContext = { id: string, type: IParticipationContextType, action: ICitizenAction };

export type ErrorContext = { error: 'taken' | 'not_entitled' | null };

export type ContextShape = ProjectContext | ErrorContext | null;

export function isProjectContext(obj: ContextShape): obj is ProjectContext {
  return (obj as ProjectContext)?.id !== undefined;
}

export function isErrorContext(obj: ContextShape): obj is ErrorContext {
  return (obj as ErrorContext)?.error !== undefined;
}

export function isProjectOrErrorContext(obj: ContextShape) {
  if (obj === null) {
    return 'null';
  } else if ((obj as any).error !== undefined) {
    return 'ProjectContext';
  } else {
    return 'ErrorContext';
  }
}

export type VerificationModalSteps = 'method-selection' | 'success' | 'error' | null | IVerificationMethod['attributes']['name'];

export interface Props {
  className?: string;
  onMounted: () => void;
}

const VerificationModal = memo<Props>(({ className, onMounted }) => {

  const authUser = useAuthUser();

  const isMounted = useIsMounted();
  const [activeStep, setActiveStep] = useState<VerificationModalSteps>(null);
  const [context, setContext] = useState<ContextShape>(null);
  const opened = !!activeStep;

  useEffect(() => {
    if (isMounted() && onMounted) {
      onMounted();
    }
  }, [onMounted]);

  useEffect(() => {
    const subscriptions = [
      openVerificationModal$.subscribe(({ eventValue: { step, context } }) => {
        if (!isNilOrError(authUser)) {
          setActiveStep(step);
          setContext(context);
        }
      }),
      closeVerificationModal$.subscribe(() => {
        setActiveStep(null);
        setContext(null);
      })
    ];

    return () => subscriptions.forEach(subscription => subscription.unsubscribe());
  }, [authUser]);

  const onClose = useCallback(() => {
    closeVerificationModal();
  }, []);

  const onComplete = useCallback(() => {
    setActiveStep('success');
    setContext(null);
  }, []);

  const onError = useCallback(() => {
    setActiveStep('error');
    setContext(null);
  }, []);

  return (
    <Modal
      width={820}
      opened={opened}
      close={onClose}
      closeOnClickOutside={false}
    >
      <Container className={`e2e-verification-steps ${className || ''}`}>
        {activeStep && activeStep !== 'success' && activeStep !== 'error' &&
          <VerificationSteps
            context={context}
            inModal={true}
            showHeader={true}
            initialActiveStep={activeStep}
            onComplete={onComplete}
            onError={onError}
          />
        }

        {activeStep === 'success' &&
          <VerificationSuccess />
        }

        {activeStep === 'error' && (context === null || isErrorContext(context)) &&
          <VerificationError context={context}/>
        }
      </Container>
    </Modal>
  );
});

export default VerificationModal;
