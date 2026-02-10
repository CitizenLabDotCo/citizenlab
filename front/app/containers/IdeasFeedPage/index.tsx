import React from 'react';

import { Box, colors, useBreakpoint } from '@citizenlab/cl2-component-library';
import { RouteType } from 'routes';
import styled from 'styled-components';

import useProjectBySlug from 'api/projects/useProjectBySlug';

import GoBackButton from 'components/UI/GoBackButton';

import { removeSearchParams } from 'utils/cl-router/removeSearchParams';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';
import { useParams, useSearch } from 'utils/router';

import AddIdeaButton from './AddIdeaButton';
import IdeasFeed from './IdeasFeed';
import IdeasFeedPageMeta from './IdeasFeedPageMeta';
import Sidebar from './Sidebar';

const PageContainer = styled.div`
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1010;
  overflow: hidden;
  background-color: ${colors.white};
`;

const IdeasFeedPage = () => {
  const { slug } = useParams({ strict: false }) as { slug: string };
  const { data: project } = useProjectBySlug(slug);
  const [searchParams] = useSearch({ strict: false });
  const selectedTopicId = searchParams.get('topic');
  const selectedSubtopicId = searchParams.get('subtopic');
  const phaseId = searchParams.get('phase_id');
  const initialIdeaId = searchParams.get('initial_idea_id');
  const sheetOpen = searchParams.get('sheet_open');
  const isMobileOrSmaller = useBreakpoint('phone');

  // Use subtopic if selected, otherwise use topic
  const activeTopicFilter = selectedSubtopicId || selectedTopicId;

  const handleSheetCollapse = () => {
    removeSearchParams(['sheet_open', 'idea_id']);
  };

  const handleSheetExpand = () => {
    updateSearchParams({ sheet_open: 'true' });
  };

  const handleMobileBackClick = () => {
    if (!sheetOpen) {
      // Sheet is collapsed -> open it
      updateSearchParams({ sheet_open: 'true' });
    } else if (selectedSubtopicId) {
      // Sheet is open with subtopic -> clear subtopic (stay on topics)
      removeSearchParams(['subtopic']);
    }
    // If sheet is open without subtopic -> handled by linkTo (exit to project)
  };

  const getMobileBackLinkTo = (): RouteType | undefined => {
    // Only exit to project when sheet is open and no subtopic selected
    if (sheetOpen && !selectedSubtopicId) {
      return `/projects/${slug}`;
    }
    return undefined;
  };

  if (!phaseId || !project) {
    return null;
  }

  return (
    <main id="e2e-project-ideas-page">
      <IdeasFeedPageMeta project={project.data} />
      <PageContainer>
        {isMobileOrSmaller && (
          <Box position="absolute" top="16px" left="16px" zIndex="1">
            <GoBackButton
              linkTo={getMobileBackLinkTo()}
              onClick={
                getMobileBackLinkTo() ? undefined : handleMobileBackClick
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
          <Sidebar
            projectId={project.data.id}
            onSheetCollapse={handleSheetCollapse}
            onSheetExpand={handleSheetExpand}
          />
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
      </PageContainer>
    </main>
  );
};

export default IdeasFeedPage;
