import React from 'react';

import { Box, Divider, Title } from '@citizenlab/cl2-component-library';

import useProjectBySlug from 'api/projects/useProjectBySlug';
import { ITopics } from 'api/topics/types';

import useLocalize from 'hooks/useLocalize';

import AvatarBubbles from 'components/AvatarBubbles';
import GoBackButton from 'components/UI/GoBackButton';

import messages from '../messages';

import SelectedTopicView from './SelectedTopicView';
import TopicItem from './TopicItem';

interface Props {
  topics: ITopics;
  selectedTopicId: string | null;
  onTopicSelect: (topicId: string | null) => void;
  totalIdeasCount: number;
  topicCounts: Record<string, number>;
  slug: string;
  showBackButton?: boolean;
}

const TopicsContent = ({
  topics,
  selectedTopicId,
  onTopicSelect,
  totalIdeasCount,
  topicCounts,
  slug,
  showBackButton = true,
}: Props) => {
  const { data: project } = useProjectBySlug(slug);
  const localize = useLocalize();
  const projectId = project?.data.id;
  const projectTitle = project
    ? localize(project.data.attributes.title_multiloc)
    : '';

  const selectedTopic = selectedTopicId
    ? topics.data.find((topic) => topic.id === selectedTopicId)
    : null;

  // When a topic is selected, show only that topic with a back button
  if (selectedTopic) {
    return (
      <SelectedTopicView
        topic={selectedTopic}
        onBack={() => onTopicSelect(null)}
        hideBackButton={!showBackButton}
      />
    );
  }

  return (
    <>
      {showBackButton && (
        <Box mb="24px">
          <GoBackButton
            linkTo={`/projects/${slug}`}
            size="s"
            customMessage={messages.backToProject}
          />
        </Box>
      )}

      <Box px="16px" mb="16px">
        <Title fontWeight="bold" variant="h4" as="h1" mb="8px">
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
      {topics.data.map((topic) => (
        <TopicItem
          key={topic.id}
          topicId={topic.id}
          topicTitle={localize(topic.attributes.title_multiloc)}
          topicDescription={localize(topic.attributes.description_multiloc)}
          isActive={selectedTopicId === topic.id}
          totalIdeasCount={totalIdeasCount}
          topicCount={topicCounts[topic.id] || 0}
          onTopicSelect={onTopicSelect}
        />
      ))}
    </>
  );
};

export default TopicsContent;
