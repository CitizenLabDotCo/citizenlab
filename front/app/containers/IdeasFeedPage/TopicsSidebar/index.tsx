import React from 'react';

import { Box, colors, useBreakpoint } from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';

import useIdeasFilterCounts from 'api/ideas_filter_counts/useIdeasFilterCounts';
import usePhases from 'api/phases/usePhases';
import { getCurrentPhase } from 'api/phases/utils';
import useProjectBySlug from 'api/projects/useProjectBySlug';
import useTopics from 'api/topics/useTopics';

import { useIntl } from 'utils/cl-intl';

import BottomSheet from '../BottomSheet';
import messages from '../messages';

import TopicsContent from './TopicsContent';

interface Props {
  selectedTopicId: string | null;
  onTopicSelect: (topicId: string | null) => void;
}

const TopicsSidebar = ({ selectedTopicId, onTopicSelect }: Props) => {
  const { formatMessage } = useIntl();
  const { slug } = useParams() as { slug: string };
  const { data: project } = useProjectBySlug(slug);
  const { data: topics, isLoading: topicsLoading } = useTopics();
  const projectId = project?.data.id;
  const { data: phases } = usePhases(projectId);
  const currentPhase = getCurrentPhase(phases?.data);
  const phaseId = currentPhase?.id;
  const isMobile = useBreakpoint('phone');

  const { data: filterCounts } = useIdeasFilterCounts({
    projects: projectId ? [projectId] : undefined,
    phase: phaseId,
  });

  const totalIdeasCount = filterCounts?.data.attributes.total || 0;
  const topicCounts = filterCounts?.data.attributes.topic_id || {};

  if (topicsLoading || !projectId) {
    return null;
  }

  if (!topics || topics.data.length === 0) {
    return null;
  }

  if (isMobile) {
    return (
      <BottomSheet
        a11y_panelLabel={formatMessage(messages.topicsPanel)}
        a11y_expandLabel={formatMessage(messages.expandPanel)}
        a11y_collapseLabel={formatMessage(messages.collapsePanel)}
      >
        <TopicsContent
          topics={topics}
          selectedTopicId={selectedTopicId}
          onTopicSelect={onTopicSelect}
          totalIdeasCount={totalIdeasCount}
          topicCounts={topicCounts}
          slug={slug}
          showBackButton={false}
        />
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
    >
      <TopicsContent
        topics={topics}
        selectedTopicId={selectedTopicId}
        onTopicSelect={onTopicSelect}
        totalIdeasCount={totalIdeasCount}
        topicCounts={topicCounts}
        slug={slug}
      />
    </Box>
  );
};

export default TopicsSidebar;
