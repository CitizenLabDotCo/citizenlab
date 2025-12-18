import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import IdeasShow from 'containers/IdeasShow';

import GoBackButton from 'components/UI/GoBackButton';

const IdeaContent = ({
  selectedIdeaId,
  selectedIdeaProjectId,
  handleCloseIdea,
}: {
  selectedIdeaId: string;
  selectedIdeaProjectId: string;
  handleCloseIdea: () => void;
}) => {
  return (
    <>
      <Box mb="16px">
        <GoBackButton onClick={handleCloseIdea} showGoBackText={false} />
      </Box>
      <Box flex="1" overflowY="auto" padding="24px">
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
