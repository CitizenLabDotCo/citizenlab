import React from 'react';

import { Box, Divider, Title } from '@citizenlab/cl2-component-library';

import useProjectBySlug from 'api/projects/useProjectBySlug';

import useLocalize from 'hooks/useLocalize';

import AvatarBubbles from 'components/AvatarBubbles';
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
  const localize = useLocalize();
  const projectId = project?.data.id;
  const projectTitle = project
    ? localize(project.data.attributes.title_multiloc)
    : '';

  // When a topic is selected, show only that topic with a back button
  if (selectedTopicId) {
    return (
      <SelectedTopicContent
        topicId={selectedTopicId}
        onBack={() => onTopicSelect(null)}
        isMobile={isMobile}
      />
    );
  }

  return (
    <>
      {!isMobile && (
        <Box mb="24px">
          <GoBackButton
            linkTo={`/projects/${slug}`}
            size="s"
            customMessage={messages.backToProject}
          />
        </Box>
      )}

      <Box px="16px" mb="16px">
        <Title fontWeight="bold" variant="h2" as="h1">
          {projectTitle}
        </Title>
        {projectId && (
          <AvatarBubbles
            context={{ type: 'project', id: projectId }}
            size={28}
          />
        )}
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
