import React, { memo, useCallback, useMemo } from 'react';

// components
import FullscreenModal from 'components/UI/FullscreenModal';
import IdeasShow from 'containers/IdeasShow';
import IdeaShowPageTopBar from 'containers/IdeasShowPage/IdeaShowPageTopBar';
import InitiativesShow from 'containers/InitiativesShow';
import InitiativeShowPageTopBar from 'containers/InitiativesShowPage/InitiativeShowPageTopBar';
import PlatformFooter from 'containers/PlatformFooter';

// hooks
import useIdea from 'hooks/useIdea';

// utils
import { isNilOrError } from 'utils/helperUtils';

interface Props {
  type: 'idea' | 'initiative' | null;
  postId: string | null;
  slug: string | null;
  navbarRef?: HTMLElement | null;
  mobileNavbarRef?: HTMLElement | null;
  close: () => void;
}

const PostPageFullscreenModal = memo<Props>(
  ({ postId, slug, type, navbarRef, mobileNavbarRef, close }) => {
    const onClose = useCallback(() => {
      close();
    }, [close]);

    // Far from ideal to always try to load the idea, but
    // has to happen for hooks to work.
    // It shows that we're putting 2 components in 1
    const idea = useIdea({ ideaId: postId });

    const topBar = useMemo(() => {
      if (postId && type === 'idea') {
        return <IdeaShowPageTopBar ideaId={postId} insideModal />;
      }

      if (postId && type === 'initiative') {
        return <InitiativeShowPageTopBar initiativeId={postId} insideModal />;
      }

      return null;
    }, [postId, type]);

    const content = useMemo(() => {
      if (postId) {
        if (type === 'idea' && !isNilOrError(idea)) {
          const projectId = idea.relationships.project.data.id;

          return (
            <>
              <IdeasShow ideaId={postId} projectId={projectId} insideModal />
              <PlatformFooter insideModal />
            </>
          );
        }

        if (type === 'initiative') {
          return (
            <>
              <InitiativesShow initiativeId={postId} />
              <PlatformFooter insideModal />
            </>
          );
        }
      }

      return null;
    }, [postId, idea]);

    return (
      <FullscreenModal
        opened={!!(postId && slug && type)}
        close={onClose}
        url={slug ? `/${type}s/${slug}` : null}
        topBar={topBar}
        navbarRef={navbarRef}
        mobileNavbarRef={mobileNavbarRef}
      >
        {content}
      </FullscreenModal>
    );
  }
);

export default PostPageFullscreenModal;
