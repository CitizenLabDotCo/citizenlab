import React, { memo, useCallback } from 'react';

// components
import FullscreenModal from 'components/UI/FullscreenModal';
import IdeasShow from 'containers/IdeasShow';
import IdeaShowPageTopBar from 'containers/IdeasShowPage//IdeaShowPageTopBar';

interface Props {
  modalOpened: boolean;
  modalUrl: string | null;
  modalId: string | null;
  modalType: string | null;
  close: () => void;
}

const IdeaPageFullscreenModal = memo<Props>(({ modalOpened, close, modalUrl, modalId, modalType }) => {

  const onClose = useCallback(() => {
    close();
  }, []);

  const topBar = ((modalOpened && modalType === 'idea' && modalId) ? <IdeaShowPageTopBar ideaId={modalId} /> : undefined);

  return (
    <FullscreenModal
      opened={modalOpened}
      close={onClose}
      url={modalUrl}
      topBar={topBar}
    >
      {modalId ? <IdeasShow ideaId={modalId} inModal={true} /> : null}
    </FullscreenModal>
  );
});

export default IdeaPageFullscreenModal;
