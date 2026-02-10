import React from 'react';

import {
  Box,
  Divider,
  Title,
  Text,
  colors,
} from '@citizenlab/cl2-component-library';
import { useSearch } from 'utils/router';

import usePhase from 'api/phases/usePhase';
import useProjectBySlug from 'api/projects/useProjectBySlug';

import AvatarBubbles from 'components/AvatarBubbles';
import T from 'components/T';
import GoBackButton from 'components/UI/GoBackButton';

import messages from '../messages';

import SelectedTopicContent from './SelectedTopicContent';
import TopicItem from './TopicItem';

interface Props {
  topicIds: string[];
  selectedTopicId: string | null;
  onTopicSelect: (topicId: string | null) => void;
  totalIdeasCount: number;
  topicCounts: Record<string, number>;
  slug: string;
  isMobile?: boolean;
}

const TopicsContent = ({
  topicIds,
  selectedTopicId,
  onTopicSelect,
  totalIdeasCount,
  topicCounts,
  slug,
  isMobile = false,
}: Props) => {
  const { data: project } = useProjectBySlug(slug);
  const [searchParams] = useSearch({ strict: false });
  const phaseId = searchParams.get('phase_id');
  const { data: phase } = usePhase(phaseId);
  const projectId = project?.data.id;

  // When a topic is selected, show only that topic with a back button
  if (selectedTopicId && projectId) {
    return (
      <SelectedTopicContent
        projectId={projectId}
        topicId={selectedTopicId}
        topicCount={topicCounts[selectedTopicId] || 0}
        topicCounts={topicCounts}
        onBack={() => onTopicSelect(null)}
        isMobile={isMobile}
      />
    );
  }

  return (
    <>
      <Box px="16px" mb="16px">
        <GoBackButton
          linkTo={`/projects/${slug}`}
          size="s"
          customMessage={messages.back}
          iconSize="20px"
          iconColor={colors.textPrimary}
          textColor={colors.textPrimary}
        />
        <Title fontWeight="bold" variant="h2" as="h1">
          <T value={phase?.data.attributes.title_multiloc} />
        </Title>
        {projectId && (
          <AvatarBubbles
            context={{ type: 'project', id: projectId }}
            size={28}
          />
        )}
        <Text>
          <T value={phase?.data.attributes.description_multiloc} supportHtml />
        </Text>
      </Box>
      <Divider mb="0px" />
      {topicIds
        .sort(
          (topic1, topic2) =>
            (topicCounts[topic2] || 0) - (topicCounts[topic1] || 0)
        )
        .map((topicId, index, sortedArray) => (
          <TopicItem
            key={topicId}
            topicId={topicId}
            isActive={selectedTopicId === topicId}
            totalIdeasCount={totalIdeasCount}
            topicCount={topicCounts[topicId] || 0}
            onTopicSelect={onTopicSelect}
            isLast={index === sortedArray.length - 1}
          />
        ))}
    </>
  );
};

export default TopicsContent;
