import React from 'react';
import { useParams } from 'react-router-dom';

// components
import { Box, useBreakpoint } from '@citizenlab/cl2-component-library';
import IdeasShow from 'containers/IdeasShow';
import IdeaShowPageTopBar from './IdeaShowPageTopBar';
import PageNotFound from 'components/PageNotFound';
import Unauthorized from 'components/Unauthorized';

// hooks
import useIdea from 'hooks/useIdea';

// style
import styled from 'styled-components';
import { media, colors } from 'utils/styleUtils';

// utils
import { isError } from 'lodash-es';
import { isUnauthorizedError } from 'utils/helperUtils';

const StyledIdeaShowPageTopBar = styled(IdeaShowPageTopBar)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
`;

// note: StyledIdeasShow styles defined here should match that in PostPageFullscreenModal!
const StyledIdeasShow = styled(IdeasShow)`
  min-height: calc(
    100vh - ${(props) => props.theme.menuHeight + props.theme.footerHeight}px
  );
  padding-top: 40px;
  padding-left: 60px;
  padding-right: 60px;

  ${media.tablet`
    min-height: calc(100vh - ${({
      theme: { mobileMenuHeight, mobileTopBarHeight },
    }) => mobileMenuHeight + mobileTopBarHeight}px);
    padding-top: 35px;
  `}

  ${media.phone`
    padding-top: 25px;
    padding-left: 15px;
    padding-right: 15px;
  `}
`;

const IdeasShowPage = () => {
  const { slug } = useParams() as { slug: string };
  const idea = useIdea({ ideaSlug: slug });
  const tablet = useBreakpoint('tablet');

  if (isUnauthorizedError(idea)) {
    return <Unauthorized />;
  }

  if (isError(idea)) {
    return <PageNotFound />;
  }

  if (idea) {
    return (
      <Box background={colors.white}>
        {tablet && (
          <StyledIdeaShowPageTopBar
            projectId={idea.relationships.project.data.id}
            ideaId={idea.id}
            insideModal={false}
          />
        )}
        <StyledIdeasShow
          ideaId={idea.id}
          projectId={idea.relationships.project.data.id}
          insideModal={false}
        />
      </Box>
    );
  }

  return null;
};

export default IdeasShowPage;
