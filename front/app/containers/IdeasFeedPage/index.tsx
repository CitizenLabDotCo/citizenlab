import React, { useCallback } from 'react';

import { Box, colors, useBreakpoint } from '@citizenlab/cl2-component-library';
import { useParams, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';

import useIdeaById from 'api/ideas/useIdeaById';
import useProjectBySlug from 'api/projects/useProjectBySlug';

import IdeasShow from 'containers/IdeasShow';

import GoBackButton from 'components/UI/GoBackButton';

import { removeSearchParams } from 'utils/cl-router/removeSearchParams';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';

import IdeasFeedPageMeta from './IdeasFeedPageMeta';
import StickyNotesPile from './StickyNotes';
import TopicsSidebar from './TopicsSidebar';

const IdeaSidebarContainer = styled(Box)`
  width: 30%;
  background: ${colors.white};
  border-right: 1px solid ${colors.grey300};
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const SidebarContent = styled(Box)`
  flex: 1;
  overflow-y: auto;
  padding: 24px;
`;

const IdeasFeedPage = () => {
  const { slug } = useParams() as { slug: string };
  const { data: project } = useProjectBySlug(slug);
  const [searchParams] = useSearchParams();
  const selectedTopicId = searchParams.get('topic');
  const phaseId = searchParams.get('phase_id');
  const selectedIdeaId = searchParams.get('idea_id');
  const isMobileOrSmaller = useBreakpoint('phone');

  const { data: selectedIdea } = useIdeaById(selectedIdeaId ?? undefined);

  const projectId = selectedIdea?.data.relationships.project.data.id;

  const setSelectedTopicId = (topicId: string | null) => {
    if (topicId) {
      updateSearchParams({ topic: topicId });
    } else {
      removeSearchParams(['topic']);
    }
  };

  const handleIdeaSelect = useCallback((ideaId: string | null) => {
    if (ideaId) {
      updateSearchParams({ idea_id: ideaId });
    } else {
      removeSearchParams(['idea_id']);
    }
  }, []);

  const handleCloseSidebar = useCallback(() => {
    removeSearchParams(['idea_id']);
  }, []);

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
          {selectedIdeaId && selectedIdea && projectId && !isMobileOrSmaller ? (
            <IdeaSidebarContainer>
              <Box>
                <GoBackButton
                  onClick={handleCloseSidebar}
                  showGoBackText={false}
                />
              </Box>
              <SidebarContent>
                <IdeasShow
                  ideaId={selectedIdeaId}
                  projectId={projectId}
                  compact={true}
                />
              </SidebarContent>
            </IdeaSidebarContainer>
          ) : (
            <TopicsSidebar
              selectedTopicId={selectedTopicId}
              onTopicSelect={setSelectedTopicId}
              selectedIdeaId={selectedIdeaId}
              selectedIdeaProjectId={projectId}
              onCloseIdea={handleCloseSidebar}
            />
          )}
          <Box flex="4">
            <StickyNotesPile
              phaseId={phaseId}
              maxNotes={20}
              onIdeaSelect={handleIdeaSelect}
            />
          </Box>
        </Box>
      </Box>
    </main>
  );
};

export default IdeasFeedPage;
