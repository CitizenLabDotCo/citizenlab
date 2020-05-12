import React, { memo, useCallback, useMemo } from 'react';

// components
import FullscreenModal from 'components/UI/FullscreenModal';
import IdeasShow from 'containers/IdeasShow';
import IdeaShowPageTopBar from 'containers/IdeasShowPage/IdeaShowPageTopBar';
import InitiativesShow from 'containers/InitiativesShow';
import InitiativeShowPageTopBar from 'containers/InitiativesShowPage/InitiativeShowPageTopBar';

interface Props {
  type: 'idea' | 'initiative' | null;
  id: string | null;
  slug: string | null;
  navbarRef?: HTMLElement | null;
  mobileNavbarRef?: HTMLElement | null;
  close: () => void;
}

const PostPageFullscreenModal = memo<Props>(({ id, slug, type, navbarRef, mobileNavbarRef, close }) => {

  const onClose = useCallback(() => {
    close();
  }, [close]);

  const topBar = useMemo(() => {
    if (id && type === 'idea') {
      return <IdeaShowPageTopBar ideaId={id} insideModal={true} />;
    }

    if (id && type === 'initiative') {
      return <InitiativeShowPageTopBar initiativeId={id} insideModal={true} />;
    }

    return null;
  }, [id, type]);

  const content = useMemo(() => {
    if (id && type) {
      return (
        <>
          {type === 'idea' && <IdeasShow ideaId={id} insideModal={true} />}
          {type === 'initiative' && <InitiativesShow initiativeId={id} insideModal={true} />}
        </>
      );
    }

    return null;
  }, [id, type]);

  return (
    <FullscreenModal
      opened={!!(id && slug && type)}
      close={onClose}
      url={slug ? `/${type}s/${slug}` : null}
      topBar={topBar}
      navbarRef={navbarRef}
      mobileNavbarRef={mobileNavbarRef}
    >
      {content}
    </FullscreenModal>
  );
});

export default PostPageFullscreenModal;
