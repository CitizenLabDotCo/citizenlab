import React, { memo, useState, useCallback, useEffect } from 'react';

// components
import Modal from 'components/UI/Modal';
import SignUpIn, { ISignUpInMetaData } from 'components/SignUpIn';

// events
import { openSignUpInModal$, closeSignUpInModal$ } from 'components/SignUpIn/signUpInModalEvents';

// style
import styled from 'styled-components';

const Container = styled.div``;

interface Props {
  className?: string;
}

const SignUpInModal = memo<Props>(({ className }) => {

  const [metaData, setMetaData] = useState<ISignUpInMetaData | undefined>(undefined);

  useEffect(() => {
    const subscriptions = [
      openSignUpInModal$.subscribe(({ eventValue: metaData }) => {
        setMetaData(metaData);
      }),
      closeSignUpInModal$.subscribe(() => {
        setMetaData(undefined);
      })
    ];

    return () => subscriptions.forEach(subscription => subscription.unsubscribe());
  }, []);

  const onClose = useCallback(() => {
    setMetaData(undefined);
  }, []);

  const onSignUpInCompleted = useCallback(() => {
    metaData?.action?.();
    setMetaData(undefined);
  }, []);

  return (
    <Modal
      width={820}
      opened={!!metaData}
      close={onClose}
    >
      <Container className={className}>
        <SignUpIn
          inModal={true}
          metaData={metaData as ISignUpInMetaData}
          onSignUpInCompleted={onSignUpInCompleted}
        />
      </Container>
    </Modal>
  );
});

export default SignUpInModal;
