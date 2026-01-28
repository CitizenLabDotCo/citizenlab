import React from 'react';

import { Box, colors, useBreakpoint } from '@citizenlab/cl2-component-library';
import { useParams, useSearchParams } from 'react-router-dom';

import useProjectBySlug from 'api/projects/useProjectBySlug';

import GoBackButton from 'components/UI/GoBackButton';

import { removeSearchParams } from 'utils/cl-router/removeSearchParams';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';

import AddIdeaButton from './AddIdeaButton';
import IdeasFeed from './IdeasFeed';
import IdeasFeedPageMeta from './IdeasFeedPageMeta';
import Sidebar from './Sidebar';

const IdeasFeedPage = () => {
  const { slug } = useParams() as { slug: string };
  const { data: project } = useProjectBySlug(slug);
  const [searchParams] = useSearchParams();
  const selectedTopicId = searchParams.get('topic');
  const selectedSubtopicId = searchParams.get('subtopic');
  const phaseId = searchParams.get('phase_id');
  const initialIdeaId = searchParams.get('initial_idea_id');
  const isMobileOrSmaller = useBreakpoint('phone');

  // Use subtopic if selected, otherwise use topic
  const activeTopicFilter = selectedSubtopicId || selectedTopicId;

  const setSelectedTopicId = (topicId: string | null) => {
    if (topicId) {
      updateSearchParams({ topic: topicId });
    } else {
      removeSearchParams(['topic', 'subtopic']);
    }
  };

  if (!phaseId || !project) {
    return null;
  }

  return (
    <main id="e2e-project-ideas-page">
      <IdeasFeedPageMeta project={project.data} />
      <Box
        w="100%"
        bgColor={colors.grey100}
        position="fixed"
        top="0"
        left="0"
        right="0"
        bottom="0"
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
          h="100dvh"
        >
          <Sidebar projectId={project.data.id} />
          <Box flex="4" position="relative">
            {/* General feed - always mounted to preserve scroll position */}
            <Box visibility={activeTopicFilter ? 'hidden' : 'visible'}>
              <IdeasFeed
                key={initialIdeaId || 'default'}
                topicId={null}
                parentTopicId={null}
              />
            </Box>

            {/* Topic/subtopic-specific feed - mounted only when topic or subtopic is selected */}
            {activeTopicFilter && (
              <Box position="absolute" top="0" left="0" right="0" bottom="0">
                <IdeasFeed
                  key={`${activeTopicFilter}-${initialIdeaId}`}
                  topicId={activeTopicFilter}
                  parentTopicId={selectedTopicId}
                />
              </Box>
            )}
          </Box>
        </Box>
        <Box
          position="absolute"
          top={isMobileOrSmaller ? '16px' : undefined}
          bottom={isMobileOrSmaller ? undefined : '24px'}
          right={isMobileOrSmaller ? '16px' : '24px'}
          zIndex="1"
        >
          <AddIdeaButton projectSlug={slug} phaseId={phaseId} />
        </Box>
      </Box>
    </main>
  );
};

export default IdeasFeedPage;
