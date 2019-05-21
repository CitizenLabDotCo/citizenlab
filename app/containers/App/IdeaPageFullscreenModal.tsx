import React, { memo, useCallback } from 'react';

// components
import FullscreenModal from 'components/UI/FullscreenModal';
import IdeasShow from 'containers/IdeasShow';
import VoteControl from 'components/VoteControl';

interface Props {
  modalOpened: boolean;
  modalUrl: string | null;
  modalId: string | null;
  modalType: string | null;
  close: () => void;
  unauthenticatedVoteClick: () => void;
}

const IdeaPageFullscreenModal = memo<Props>(({ modalOpened, close, modalUrl, modalId, modalType, unauthenticatedVoteClick }) => {

  const onClose = useCallback(
    () => {
      close();
    },
    []
  );

  const onUnauthenticatedVoteClick = useCallback(
    () => {
      unauthenticatedVoteClick();
    },
    []
  );

  const fullscreenModalHeaderChild = ((modalOpened && modalType === 'idea' && modalId) ? (
    <VoteControl
      ideaId={modalId}
      unauthenticatedVoteClick={onUnauthenticatedVoteClick}
      size="1"
    />
  ) : undefined);

  return (
    <FullscreenModal
      opened={modalOpened}
      close={onClose}
      url={modalUrl}
      headerChild={fullscreenModalHeaderChild}
    >
      {modalId ? <IdeasShow ideaId={modalId} inModal={true}/> : null}
    </FullscreenModal>
  );
});

export default IdeaPageFullscreenModal;
