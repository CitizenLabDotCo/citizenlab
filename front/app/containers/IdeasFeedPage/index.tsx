import React from 'react';

import { Box, colors, useBreakpoint } from '@citizenlab/cl2-component-library';
import { useParams, useSearchParams } from 'react-router-dom';

import useProjectBySlug from 'api/projects/useProjectBySlug';

import GoBackButton from 'components/UI/GoBackButton';

import IdeasFeedPageMeta from './IdeasFeedPageMeta';
import StickyNotesPile from './StickyNotes';
import TopicsSidebar from './TopicsSidebar';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';
import { removeSearchParams } from 'utils/cl-router/removeSearchParams';

const IdeasFeedPage = () => {
  const { slug } = useParams() as { slug: string };
  const { data: project } = useProjectBySlug(slug);
  const [searchParams] = useSearchParams();
  const selectedTopicId = searchParams.get('topic');
  const phaseId = searchParams.get('phase_id');
  const isMobileOrSmaller = useBreakpoint('phone');

  const setSelectedTopicId = (topicId: string | null) => {
    if (topicId) {
      updateSearchParams({ topic: topicId });
    } else {
      removeSearchParams(['topic']);
    }
  };

  if (!phaseId) {
    return null;
  }

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
        {isMobileOrSmaller && (
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
          <Box flex="4">
            <StickyNotesPile phaseId={phaseId} maxNotes={20} />
          </Box>
        </Box>
      </Box>
    </main>
  );
};

export default IdeasFeedPage;
