import React, { memo, useCallback, useState } from 'react';

// components
import Modal from 'components/UI/Modal';
import VerificationMethods from './VerificationMethods';
import VerificationFormCOW from './VerificationFormCOW';
import VerificationSuccess from './VerificationSuccess';

// utils
import eventEmitter from 'utils/eventEmitter';

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

export type VerificationModalSteps = 'method-selection' | 'cow' | 'success' | null;

export interface Props {
  opened: boolean;
  initialActiveStep?: VerificationModalSteps;
  className?: string;
  context?: boolean; // TODO change to pass in additionnal rules info
}

const VerificationModal = memo<Props>((props) => {

  const [activeStep, setActiveStep] = useState<VerificationModalSteps>(props.initialActiveStep || 'method-selection');

  const onMethodSelected = useCallback((selectedMethod: VerificationMethodNames) => {
    setActiveStep(selectedMethod);
  }, []);

  const onClose = useCallback(() => {
    eventEmitter.emit('VerificationModal', 'closeVerificationModal', null);
  }, []);

  const onCowCancel = useCallback(() => {
    setActiveStep('method-selection');
  }, []);

  const onCowVerified = useCallback(() => {
    setActiveStep('success');
  }, []);

  return (
    <Modal
      width={820}
      opened={props.opened}
      close={onClose}
    >
      <Container className={props.className || ''}>
        {activeStep === 'method-selection' &&
          <VerificationMethods withContext={!!props.context} onMethodSelected={onMethodSelected} />
        }

        {activeStep === 'cow' &&
          <VerificationFormCOW onCancel={onCowCancel} onVerified={onCowVerified} />
        }

        {activeStep === 'success' &&
          <VerificationSuccess />
        }
      </Container>
    </Modal>
  );
});

export default VerificationModal;
