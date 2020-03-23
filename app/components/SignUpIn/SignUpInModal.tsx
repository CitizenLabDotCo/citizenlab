import React, { memo, useState, useCallback, useEffect } from 'react';

// components
import Modal from 'components/UI/Modal';
import SignUpIn from 'components/SignUpIn';

// events
import { openSignUpInModal$, closeSignUpInModal$ } from 'components/SignUpIn/signUpInModalEvents';

// style
import styled from 'styled-components';

const Container = styled.div``;

interface Props {
  className?: string;
}

const SignUpInModal = memo<Props>(({ className }) => {

  const [opened, setOpened] = useState(false);

  useEffect(() => {
    const subscriptions = [
      openSignUpInModal$.subscribe(() => {
        setOpened(true);
      }),
      closeSignUpInModal$.subscribe(() => {
        setOpened(false);
      })
    ];

    return () => subscriptions.forEach(subscription => subscription.unsubscribe());
  }, []);

  const onClose = useCallback(() => {
    setOpened(false);
  }, []);

  return (
    <Modal
      width={820}
      opened={opened}
      close={onClose}
    >
      <Container className={className}>
        <SignUpIn
          initialActiveSignUpInMethod="signup"
          inModal={true}
          onSignUpInCompleted={onClose}
        />
      </Container>
    </Modal>
  );
});

export default SignUpInModal;
