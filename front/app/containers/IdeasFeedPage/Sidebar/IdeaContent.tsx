import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import IdeasShow from 'containers/IdeasShow';

import GoBackButton from 'components/UI/GoBackButton';

const IdeaContent = ({
  selectedIdeaId,
  selectedIdeaProjectId,
  handleCloseIdea,
  onUnauthenticatedCommentClick,
}: {
  selectedIdeaId: string;
  selectedIdeaProjectId: string;
  handleCloseIdea: () => void;
  onUnauthenticatedCommentClick: () => void;
}) => {
  // When an unauthenticated user tries to comment, set this idea as the initial
  // idea so it stays selected after the auth flow completes

  return (
    <>
      <Box mb="16px">
        <GoBackButton onClick={handleCloseIdea} size="s" />
      </Box>
      <Box flex="1" overflowY="auto">
        <IdeasShow
          ideaId={selectedIdeaId!}
          projectId={selectedIdeaProjectId!}
          compact={true}
          onUnauthenticatedCommentClick={onUnauthenticatedCommentClick}
        />
      </Box>
    </>
  );
};

export default IdeaContent;
