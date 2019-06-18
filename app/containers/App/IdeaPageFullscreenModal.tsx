import React, { memo, useCallback, useMemo } from 'react';

// components
import FullscreenModal from 'components/UI/FullscreenModal';
import IdeasShow from 'containers/IdeasShow';
import IdeaShowPageTopBar from 'containers/IdeasShowPage/IdeaShowPageTopBar';

interface Props {
  ideaId: string | null;
  ideaSlug: string | null;
  close: () => void;
}

const IdeaPageFullscreenModal = memo<Props>(({ ideaId, ideaSlug, close }) => {

  const onClose = useCallback(() => {
    close();
  }, []);

  const topBar = useMemo(() => {
    return (ideaId ? <IdeaShowPageTopBar ideaId={ideaId} insideModal={true} /> : null);
  }, [ideaId]);

  const content = useMemo(() => {
    return (ideaId ? <IdeasShow ideaId={ideaId} inModal={true} /> : null);
  }, [ideaId]);

  return (
    <FullscreenModal
      opened={!!(ideaId && ideaSlug)}
      close={onClose}
      url={ideaSlug ? `/ideas/${ideaSlug}` : null}
      topBar={topBar}
    >
      {content}
    </FullscreenModal>
  );
});

export default IdeaPageFullscreenModal;
