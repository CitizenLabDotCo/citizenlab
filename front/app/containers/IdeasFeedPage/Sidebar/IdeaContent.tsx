import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import IdeasShow from 'containers/IdeasShow';

import GoBackButton from 'components/UI/GoBackButton';

const IdeaContent = ({
  selectedIdeaId,
  selectedIdeaProjectId,
  handleCloseIdea,
  isMobile = false,
}: {
  selectedIdeaId: string;
  selectedIdeaProjectId: string;
  handleCloseIdea: () => void;
  isMobile?: boolean;
}) => {
  return (
    <>
      <Box mb="16px">
        <GoBackButton
          onClick={handleCloseIdea}
          size="s"
          showGoBackText={!isMobile}
        />
      </Box>
      <Box flex="1" overflowY="auto">
        <IdeasShow
          ideaId={selectedIdeaId!}
          projectId={selectedIdeaProjectId!}
          compact={true}
        />
      </Box>
    </>
  );
};

export default IdeaContent;
