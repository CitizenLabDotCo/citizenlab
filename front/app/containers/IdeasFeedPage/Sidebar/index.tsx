import React, { useEffect, useRef } from 'react';

import { Box, colors, useBreakpoint } from '@citizenlab/cl2-component-library';

import useIdeaById from 'api/ideas/useIdeaById';
import useIdeasFilterCounts from 'api/ideas_filter_counts/useIdeasFilterCounts';
import useInputTopics from 'api/input_topics/useInputTopics';
import usePhase from 'api/phases/usePhase';
import { getInputTerm } from 'api/phases/utils';

import IdeasShow from 'containers/IdeasShow';

import GoBackButton from 'components/UI/GoBackButton';

import { useIntl } from 'utils/cl-intl';
import { removeSearchParams } from 'utils/cl-router/removeSearchParams';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';
import { useParams, useSearch } from 'utils/router';

import BottomSheet from '../BottomSheet';
import messages from '../messages';

import IdeaContent from './IdeaContent';
import TopicsContent from './TopicsContent';

interface Props {
  projectId: string;
  onSheetCollapse?: () => void;
  onSheetExpand?: () => void;
}

const Sidebar = ({ projectId, onSheetCollapse, onSheetExpand }: Props) => {
  const { formatMessage } = useIntl();
  const contentRef = useRef<HTMLDivElement>(null);
  const { slug } = useParams({ strict: false }) as { slug: string };
  const [searchParams] = useSearch({ strict: false });
  const selectedTopicId = searchParams.get('topic');
  const selectedIdeaId = searchParams.get('idea_id');
  const phaseId = searchParams.get('phase_id');
  const sheetOpen = searchParams.get('sheet_open');
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

  const { data: phase } = usePhase(phaseId);
  const inputTerm = phase ? getInputTerm([phase.data]) : 'idea';

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
    removeSearchParams(['idea_id', 'sheet_open']);
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
        expandToFullscreenOn={sheetOpen}
        inputTerm={inputTerm}
        onCollapse={onSheetCollapse}
        onExpand={onSheetExpand}
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
      maxWidth="450px"
    >
      {showIdeaDetail ? (
        <>
          <Box flex="1" overflowY="auto" px="16px" pb="16px">
            <GoBackButton
              onClick={handleCloseIdea}
              size="s"
              iconSize="20px"
              iconColor={colors.textPrimary}
              textColor={colors.textPrimary}
              customMessage={messages.back}
              pb="16px"
            />
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
