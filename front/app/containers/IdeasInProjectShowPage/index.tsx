import React, { useState } from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';

import useProjectBySlug from 'api/projects/useProjectBySlug';

import StickyNotesPile from './StickyNotesPile';
import TopicsSidebar from './TopicsSidebar';

const IdeasInProjectShowPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: project } = useProjectBySlug(slug);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const params = { projects: [project?.data.id] };
  const queryParameters = selectedTopicId
    ? { ...params, topics: [selectedTopicId] }
    : { ...params };

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
          <Box flex="4">
            <StickyNotesPile queryParameters={queryParameters} maxNotes={25} />
          </Box>
        </Box>
      </Box>
    </main>
  );
};

export default IdeasInProjectShowPage;
