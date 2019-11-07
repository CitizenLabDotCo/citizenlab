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

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export type VerificationModalSteps = 'method-selection' | 'cow' | 'bogus' | 'success' | null;

export interface Props {
  opened: boolean;
  initialActiveStep?: VerificationModalSteps;
  className?: string;
  context?: boolean; // TODO change to pass in additionnal rules info
}

const VerificationModal = memo<Props>((props) => {

  const [activeStep, setActiveStep] = useState<VerificationModalSteps>(props.initialActiveStep || 'method-selection');

  useEffect(() => {
    // reset active step when modal opens or closes
    setActiveStep(props.initialActiveStep || 'method-selection');
  }, [props.opened, props.initialActiveStep]);

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
      opened={props.opened}
      close={onClose}
    >
      <Container className={`e2e-verification-modal ${props.className || ''}`}>
        {activeStep === 'method-selection' &&
          <VerificationMethods withContext={!!props.context} onMethodSelected={onMethodSelected} />
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
