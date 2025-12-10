import React, { useState } from 'react';

import { Box, colors, useBreakpoint } from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';

import useProjectBySlug from 'api/projects/useProjectBySlug';

import GoBackButton from 'components/UI/GoBackButton';

import IdeasFeedPageMeta from './IdeasFeedPageMeta';
import TopicsSidebar from './TopicsSidebar';

const IdeasFeedPage = () => {
  const { slug } = useParams() as { slug: string };
  const { data: project } = useProjectBySlug(slug);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const isMobile = useBreakpoint('phone');

  return (
    <main id="e2e-project-ideas-page">
      {project && <IdeasFeedPageMeta project={project.data} />}
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
        {isMobile && (
          <Box position="absolute" top="16px" left="16px" zIndex="1">
            <GoBackButton
              linkTo={selectedTopicId ? undefined : `/projects/${slug}`}
              onClick={
                selectedTopicId ? () => setSelectedTopicId(null) : undefined
              }
              showGoBackText={false}
              buttonStyle="white"
            />
          </Box>
        )}
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
          <Box flex="4">Sticky notes will be placed here</Box>
        </Box>
      </Box>
    </main>
  );
};

export default IdeasFeedPage;
