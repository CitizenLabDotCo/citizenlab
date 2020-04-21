import React, { memo, useState, useCallback, useEffect } from 'react';

// components
import Modal from 'components/UI/Modal';
import SignUpIn, { ISignUpInMetaData } from 'components/SignUpIn';

// hooks
import useIsMounted from 'hooks/useIsMounted';

// events
import { openSignUpInModal$, closeSignUpInModal$ } from 'components/SignUpIn/signUpInModalEvents';

// style
import styled from 'styled-components';

const Container = styled.div``;

interface Props {
  className?: string;
  onMounted?: () => void;
}

const SignUpInModal = memo<Props>(({ className, onMounted }) => {

  const isMounted = useIsMounted();
  const [metaData, setMetaData] = useState<ISignUpInMetaData | undefined>(undefined);
  const opened = !!metaData;

  useEffect(() => {
    if (isMounted() && onMounted) {
      onMounted();
    }
  }, [onMounted]);

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
  }, [metaData]);

  return (
    <Modal
      width={550}
      noPadding={true}
      opened={opened}
      close={onClose}
      closeOnClickOutside={false}
    >
      <Container className={className}>
        {opened && metaData &&
          <SignUpIn
            inModal={true}
            metaData={metaData}
            onSignUpInCompleted={onSignUpInCompleted}
          />
        }
      </Container>
    </Modal>
  );
});

export default SignUpInModal;
