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
import useWindowSize from 'hooks/useWindowSize';

// events
import {
  openVerificationModal$,
  closeVerificationModal$,
  closeVerificationModal,
} from 'components/Verification/verificationModalEvents';

// style
import styled from 'styled-components';
import { viewportWidths } from 'utils/styleUtils';

// typings
import { IVerificationMethod } from 'services/verificationMethods';
import { IParticipationContextType, IPCAction } from 'typings';
import { IInitiativeAction } from 'services/initiatives';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding-top: 40px;
  padding-left: 20px;
  padding-right: 20px;
`;

export type ProjectContext = {
  id: string;
  type: IParticipationContextType;
  action: IPCAction;
};

export type InitiativeContext = {
  type: 'initiative';
  action: IInitiativeAction;
};

export type IVerificationError = 'taken' | 'not_entitled' | null;

export type ContextShape =
  | ProjectContext
  | InitiativeContext
  | null
  | undefined;

export function isProjectContext(obj: ContextShape): obj is ProjectContext {
  return (obj as ProjectContext)?.id !== undefined;
}
export function isInitiativeContext(
  obj: ContextShape
): obj is InitiativeContext {
  return (obj as InitiativeContext)?.type === 'initiative';
}

export type TVerificationSteps =
  | 'method-selection'
  | 'success'
  | 'error'
  | null
  | IVerificationMethod['attributes']['name'];

export type VerificationModalSteps =
  | 'method-selection'
  | 'success'
  | 'error'
  | null
  | IVerificationMethod['attributes']['name'];

export interface Props {
  className?: string;
  onMounted: () => void;
}

const VerificationModal = memo<Props>(({ className, onMounted }) => {
  const authUser = useAuthUser();
  const { windowWidth } = useWindowSize();

  const isMounted = useIsMounted();
  const [activeStep, setActiveStep] = useState<VerificationModalSteps>(null);
  const [context, setContext] = useState<ContextShape>(null);
  const [error, setError] = useState<IVerificationError>(null);
  const opened = !!activeStep;

  const smallerThanSmallTablet = windowWidth <= viewportWidths.smallTablet;

  useEffect(() => {
    if (isMounted() && onMounted) {
      onMounted();
    }
  }, [onMounted]);

  useEffect(() => {
    const subscriptions = [
      openVerificationModal$.subscribe(
        ({ eventValue: { step, context, error } }) => {
          if (!isNilOrError(authUser)) {
            setActiveStep(step);
            setContext(context);
            error && setError(error);
          }
        }
      ),
      closeVerificationModal$.subscribe(() => {
        setActiveStep(null);
        setContext(null);
      }),
    ];

    return () =>
      subscriptions.forEach((subscription) => subscription.unsubscribe());
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
      padding={smallerThanSmallTablet ? '0px 5px 0px 5px' : '0px 20px 0px 20px'}
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
            onComplete={onComplete}
            onError={onError}
          />
        )}

        {activeStep === 'success' && <VerificationSuccess onClose={onClose} />}

        {activeStep === 'error' && <VerificationError error={error} />}
      </Container>
    </Modal>
  );
});

export default VerificationModal;
