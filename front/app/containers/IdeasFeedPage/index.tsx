import React, { useState } from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';

import TopicsSidebar from './TopicsSidebar';

const IdeasFeedPage = () => {
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);

  return (
    <main id="e2e-project-ideas-page">
      <Box
        w="100%"
        bgColor={colors.grey100}
        h="100vh"
        position="absolute"
        top="0"
        right="0"
        zIndex="1010"
        overflow="hidden"
      >
        <Box
          mx="auto"
          position="relative"
          display="flex"
          overflow="auto"
          h="100vh"
        >
          <TopicsSidebar
            selectedTopicId={selectedTopicId}
            onTopicSelect={setSelectedTopicId}
          />
          <Box flex="4">Sticky notes will come here</Box>
        </Box>
      </Box>
    </main>
  );
};

export default IdeasFeedPage;
