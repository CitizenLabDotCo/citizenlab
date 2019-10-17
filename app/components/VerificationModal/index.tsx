import React, { memo, useCallback, useState } from 'react';

// components
import Modal from 'components/UI/Modal';
import VerificationMethods from './VerificationMethods';
import VerificationFormCOW from './VerificationFormCOW';

// hooks
import useVerificationMethods from 'hooks/useVerificationMethods';

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

interface Props {
  className?: string;
}

const VerificationModal = memo<Props>(({ className }) => {

  const [opened, setOpened] = useState(true);
  const [activeStep, setActiveStep] = useState<'methods' | 'cow'>('methods');

  // const verificationMethods = useVerificationMethods();
  // console.log(verificationMethods);

  const onMethodSelected = useCallback((selectedMethod: VerificationMethodNames) => {
    setActiveStep(selectedMethod);
  }, []);

  const onClose = useCallback(() => {
    setOpened(false);
  }, []);

  const onCowCancel = useCallback(() => {
    setActiveStep('methods');
  }, []);

  return (
    <Modal
      width="820px"
      opened={opened}
      close={onClose}
    >
      <Container className={className}>
        {activeStep === 'methods' &&
          <VerificationMethods onMethodSelected={onMethodSelected} />
        }

        {activeStep === 'cow' &&
          <VerificationFormCOW onCancel={onCowCancel} />
        }
      </Container>
    </Modal>
  );
});

export default VerificationModal;
