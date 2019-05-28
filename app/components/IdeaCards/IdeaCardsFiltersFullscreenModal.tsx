import React, { memo, useCallback } from 'react';

// components
import FullscreenModal from 'components/UI/FullscreenModal';

interface Props {
  modalOpened: boolean;
  close: () => void;
}

const IdeaCardsFiltersFullscreenModal = memo<Props>(({ modalOpened, close }) => {

  const onClose = useCallback(() => {
    close();
  }, []);

  return (
    <FullscreenModal
      opened={modalOpened}
      close={onClose}
    >
      <>bleh</>
    </FullscreenModal>
  );
});

export default IdeaCardsFiltersFullscreenModal;
