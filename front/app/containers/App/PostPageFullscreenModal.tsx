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
import useWindowSize from 'hooks/useWindowSize';

// utils
import { isNilOrError } from 'utils/helperUtils';

// style
import styled from 'styled-components';
import { media, viewportWidths } from 'utils/styleUtils';

// note: StyledIdeasShow styles defined here should match that in IdeasShowPage!
const StyledIdeasShow = styled(IdeasShow)`
  min-height: calc(
    100vh - ${(props) => props.theme.menuHeight + props.theme.footerHeight}px
  );
  padding-top: 40px;
  padding-left: 60px;
  padding-right: 60px;

  ${media.smallerThanMaxTablet`
    min-height: calc(100vh - ${({
      theme: { mobileMenuHeight, mobileTopBarHeight },
    }) => mobileMenuHeight + mobileTopBarHeight}px);
    padding-top: 35px;
  `}

  ${media.smallerThanMinTablet`
    padding-top: 25px;
    padding-left: 15px;
    padding-right: 15px;
  `}
`;

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
    const { windowWidth } = useWindowSize();
    const smallerThanMaxTablet = windowWidth <= viewportWidths.largeTablet;

    // Far from ideal to always try to load the idea, but
    // has to happen for hooks to work.
    // It shows that we're putting 2 components in 1
    const idea = useIdea({ ideaId: postId });

    const topBar = useMemo(() => {
      if (postId && type === 'idea' && smallerThanMaxTablet) {
        return <IdeaShowPageTopBar ideaId={postId} insideModal />;
      }

      if (postId && type === 'initiative') {
        return <InitiativeShowPageTopBar initiativeId={postId} insideModal />;
      }

      return null;
    }, [postId, type, smallerThanMaxTablet]);

    const content = useMemo(() => {
      if (postId) {
        if (type === 'idea' && !isNilOrError(idea)) {
          const projectId = idea.relationships.project.data.id;

          return (
            <>
              <StyledIdeasShow
                ideaId={postId}
                projectId={projectId}
                insideModal={true}
              />
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
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [postId, idea]);

    const onClose = useCallback(() => {
      close();
    }, [close]);

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
