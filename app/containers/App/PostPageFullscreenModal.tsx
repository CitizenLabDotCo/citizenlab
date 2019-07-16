import React, { memo, useCallback, useMemo } from 'react';

// components
import FullscreenModal from 'components/UI/FullscreenModal';
import IdeasShow from 'containers/IdeasShow';
import IdeaShowPageTopBar from 'containers/IdeasShowPage/IdeaShowPageTopBar';

interface Props {
  type: 'idea' | 'initiative' | null;
  id: string | null;
  slug: string | null;
  close: () => void;
}

const PostPageFullscreenModal = memo<Props>(({ id, slug, type, close }) => {

  const onClose = useCallback(() => {
    close();
  }, []);

  const topBar = useMemo(() => {
    return (id ? <IdeaShowPageTopBar ideaId={id} insideModal={true} /> : null);
  }, [id]);

  const content = useMemo(() => {
    return (id ? <IdeasShow ideaId={id} inModal={true} /> : null);
  }, [id]);

  return (
    <FullscreenModal
      opened={!!(id && slug && type)}
      close={onClose}
      url={slug ? `/ideas/${slug}` : null}
      topBar={topBar}
    >
      {content}
    </FullscreenModal>
  );
});

export default PostPageFullscreenModal;
