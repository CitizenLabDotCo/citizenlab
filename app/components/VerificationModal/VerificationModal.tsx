import React, { memo, useCallback, useState, useEffect } from 'react';

// components
import Modal from 'components/UI/Modal';
import VerificationMethods from './VerificationMethods';
import VerificationFormCOW from './VerificationFormCOW';
import VerificationFormBogus from './VerificationFormBogus';
import VerificationSuccess from './VerificationSuccess';

// events
import { closeVerificationModal } from 'containers/App/events';

// style
import styled from 'styled-components';

// typings
import { VerificationMethodNames } from 'services/verificationMethods';
import { IParticipationContextType, ICitizenAction } from 'typings';

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export type ContextShape = { id: string, type: IParticipationContextType, action: ICitizenAction } | null;

export type VerificationModalSteps = 'method-selection' | 'cow' | 'bogus' | 'success' | null;

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

  const onMethodSelected = useCallback((selectedMethod: VerificationMethodNames) => {
    setActiveStep(selectedMethod);
  }, []);

  const onClose = useCallback(() => {
    closeVerificationModal('VerificationModal');
  }, []);

  const onCowCancel = useCallback(() => {
    setActiveStep('method-selection');
  }, []);

  const onCowVerified = useCallback(() => {
    setActiveStep('success');
  }, []);

  const onBogusCancel = useCallback(() => {
    setActiveStep('method-selection');
  }, []);

  const onBogusVerified = useCallback(() => {
    setActiveStep('success');
  }, []);

  return (
    <Modal
      width={820}
      opened={opened}
      close={onClose}
      remaining
    >
      <Container className={`e2e-verification-modal ${className || ''}`}>
        {activeStep === 'method-selection' &&
          <VerificationMethods context={context} onMethodSelected={onMethodSelected} />
        }

        {activeStep === 'cow' &&
          <VerificationFormCOW onCancel={onCowCancel} onVerified={onCowVerified} />
        }

        {activeStep === 'bogus' &&
          <VerificationFormBogus onCancel={onBogusCancel} onVerified={onBogusVerified} />
        }

        {activeStep === 'success' &&
          <VerificationSuccess />
        }
      </Container>
    </Modal>
  );
});

export default VerificationModal;
