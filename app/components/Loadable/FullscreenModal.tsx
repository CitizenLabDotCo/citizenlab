import React from 'react';
import Loadable from 'react-loadable';

type InputProps = {
  modalOpened: boolean;
  close: () => void;
  modalUrl: string | null;
  modalId: string | null;
  modalType: string | null;
  unauthenticatedVoteClick: () => void;
};

const LoadableFullscreenModal = Loadable.Map({
  loading: () => null,
  loader: {
    FullscreenModal: () => import('components/UI/FullscreenModal'),
    IdeasShow: () => import('containers/IdeasShow'),
    VoteControl: () => import('components/VoteControl'),
  },
  render(loaded, props: InputProps) {
    const FullscreenModal = loaded.FullscreenModal.default;
    const IdeasShow = loaded.IdeasShow.default;
    const VoteControl = loaded.VoteControl.default;
    const { modalOpened, close, modalUrl, modalId, modalType, unauthenticatedVoteClick } = props;

    const fullscreenModalHeaderChild = ((modalOpened && modalType === 'idea' && modalId) ? (
      <VoteControl
        ideaId={modalId}
        unauthenticatedVoteClick={unauthenticatedVoteClick}
        size="1"
      />
    ) : undefined);

    return (
      <FullscreenModal
        opened={modalOpened}
        close={close}
        url={modalUrl}
        headerChild={fullscreenModalHeaderChild}
      >
        {modalId ? <IdeasShow ideaId={modalId} inModal={true}/> : null}
      </FullscreenModal>
    );
  }
});

export default LoadableFullscreenModal;
