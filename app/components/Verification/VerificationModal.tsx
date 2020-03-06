import React, { memo, useCallback, useState, useEffect } from 'react';

// components
import Modal from 'components/UI/Modal';
import VerificationSuccess from './VerificationSuccess';
import VerificationError from './VerificationError';
import VerificationSteps from './VerificationSteps';

// events
import { closeVerificationModal } from 'containers/App/verificationModalEvents';

// style
import styled from 'styled-components';

// typings
import { IVerificationMethod } from 'services/verificationMethods';
import { IParticipationContextType, ICitizenAction } from 'typings';

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
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
  opened: boolean;
  initialActiveStep?: VerificationModalSteps;
  className?: string;
  context: ContextShape; // TODO change to pass in additionnal rules info
}

const VerificationModal = memo<Props>(({ opened, className, context, initialActiveStep }) => {

  const [activeStep, setActiveStep] = useState<VerificationModalSteps>(initialActiveStep || 'method-selection');

  useEffect(() => {
    // reset active step when modal opens or closes
    setActiveStep(initialActiveStep || 'method-selection');
  }, [opened, initialActiveStep]);

  const onClose = useCallback(() => {
    closeVerificationModal('VerificationModal');
  }, []);

  const onErrorBack = useCallback(() => {
    console.log('onErrorBack');
  }, []);

  const onComplete = useCallback(() => {
    setActiveStep('success');
  }, []);

  const onError = useCallback(() => {
    setActiveStep('error');
  }, []);

  return (
    <Modal
      width={820}
      opened={opened}
      close={onClose}
    >
      <Container className={`e2e-verification-modal ${className || ''}`}>
        <VerificationSteps
          context={context}
          initialActiveStep={initialActiveStep || 'method-selection'}
          onComplete={onComplete}
          onError={onError}
        />

        {activeStep === 'success' &&
          <VerificationSuccess />
        }

        {activeStep === 'error' && (context === null || isErrorContext(context)) &&
          <VerificationError onBack={onErrorBack} context={context}/>
        }
      </Container>
    </Modal>
  );
});

export default VerificationModal;
