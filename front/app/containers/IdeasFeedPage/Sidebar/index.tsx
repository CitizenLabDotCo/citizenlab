import React, { useEffect, useRef } from 'react';

import { Box, colors, useBreakpoint } from '@citizenlab/cl2-component-library';
import { useParams, useSearchParams } from 'react-router-dom';

import useIdeaById from 'api/ideas/useIdeaById';
import useIdeasFilterCounts from 'api/ideas_filter_counts/useIdeasFilterCounts';
import useInputTopics from 'api/input_topics/useInputTopics';

import IdeasShow from 'containers/IdeasShow';

import GoBackButton from 'components/UI/GoBackButton';

import { useIntl } from 'utils/cl-intl';
import { removeSearchParams } from 'utils/cl-router/removeSearchParams';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';

import BottomSheet from '../BottomSheet';
import messages from '../messages';

import IdeaContent from './IdeaContent';
import TopicsContent from './TopicsContent';

const Sidebar = ({ projectId }: { projectId: string }) => {
  const { formatMessage } = useIntl();
  const contentRef = useRef<HTMLDivElement>(null);
  const { slug } = useParams() as { slug: string };
  const [searchParams] = useSearchParams();
  const selectedTopicId = searchParams.get('topic');
  const selectedIdeaId = searchParams.get('idea_id');
  const isMobile = useBreakpoint('phone');

  useEffect(() => {
    if (selectedIdeaId && contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [selectedIdeaId]);

  const { data: topics, isLoading: topicsLoading } = useInputTopics(projectId, {
    sort: '-ideas_count',
    depth: 0,
  });

  const { data: filterCounts } = useIdeasFilterCounts({
    projects: [projectId],
  });

  const { data: selectedIdea } = useIdeaById(selectedIdeaId ?? undefined);
  const selectedIdeaProjectId =
    selectedIdea?.data.relationships.project.data.id;

  const totalIdeasCount = filterCounts?.data.attributes.total || 0;
  const topicCounts = filterCounts?.data.attributes.input_topic_id || {};

  const setSelectedTopicId = (topicId: string | null) => {
    if (topicId) {
      updateSearchParams({ topic: topicId });
    } else {
      removeSearchParams(['topic', 'subtopic']);
    }
  };

  const handleCloseIdea = () => {
    removeSearchParams(['idea_id']);
  };

  const handleUnauthenticatedCommentClick = () => {
    updateSearchParams({ initial_idea_id: selectedIdeaId });
  };

  if (topicsLoading || !projectId) {
    return null;
  }

  if (!topics || topics.data.length === 0) {
    return null;
  }

  const topicIds = topics.data.map((topic) => topic.id);

  const showIdeaDetail =
    selectedIdeaId && selectedIdea && selectedIdeaProjectId;

  if (isMobile) {
    return (
      <BottomSheet
        a11y_panelLabel={formatMessage(messages.topicsPanel)}
        a11y_expandLabel={formatMessage(messages.expandPanel)}
        a11y_collapseLabel={formatMessage(messages.collapsePanel)}
        expandToFullscreenOn={selectedIdeaId}
      >
        {showIdeaDetail ? (
          <IdeaContent
            selectedIdeaId={selectedIdeaId}
            selectedIdeaProjectId={selectedIdeaProjectId}
            handleCloseIdea={handleCloseIdea}
            onUnauthenticatedCommentClick={handleUnauthenticatedCommentClick}
          />
        ) : (
          <TopicsContent
            topicIds={topicIds}
            selectedTopicId={selectedTopicId}
            onTopicSelect={setSelectedTopicId}
            totalIdeasCount={totalIdeasCount}
            topicCounts={topicCounts}
            slug={slug}
            isMobile={true}
          />
        )}
      </BottomSheet>
    );
  }

  return (
    <Box
      width="30%"
      background={colors.white}
      borderRight={`1px solid ${colors.grey300}`}
      py="20px"
      overflowY="auto"
      ref={contentRef}
    >
      {showIdeaDetail ? (
        <>
          <Box mb="16px">
            <GoBackButton onClick={handleCloseIdea} showGoBackText={false} />
          </Box>
          <Box flex="1" overflowY="auto" padding="24px">
            <IdeasShow
              ideaId={selectedIdeaId}
              projectId={selectedIdeaProjectId}
              compact={true}
              onUnauthenticatedCommentClick={handleUnauthenticatedCommentClick}
            />
          </Box>
        </>
      ) : (
        <TopicsContent
          topicIds={topicIds}
          selectedTopicId={selectedTopicId}
          onTopicSelect={setSelectedTopicId}
          totalIdeasCount={totalIdeasCount}
          topicCounts={topicCounts}
          slug={slug}
        />
      )}
    </Box>
  );
};

export default Sidebar;
