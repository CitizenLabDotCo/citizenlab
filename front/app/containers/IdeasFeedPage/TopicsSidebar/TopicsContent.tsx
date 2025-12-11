import React from 'react';

import { Box, Divider, Title } from '@citizenlab/cl2-component-library';

import useProjectBySlug from 'api/projects/useProjectBySlug';

import useLocalize from 'hooks/useLocalize';

import AvatarBubbles from 'components/AvatarBubbles';
import GoBackButton from 'components/UI/GoBackButton';

import messages from '../messages';

import SelectedTopicView from './SelectedTopicView';
import TopicItem from './TopicItem';

interface Props {
  topicIds: string[];
  selectedTopicId: string | null;
  onTopicSelect: (topicId: string | null) => void;
  totalIdeasCount: number;
  topicCounts: Record<string, number>;
  slug: string;
  showBackButton?: boolean;
}

const TopicsContent = ({
  topicIds,
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

  // When a topic is selected, show only that topic with a back button
  if (selectedTopicId) {
    return (
      <SelectedTopicView
        topicId={selectedTopicId}
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
      {topicIds.map((topicId) => (
        <TopicItem
          key={topicId}
          topicId={topicId}
          isActive={selectedTopicId === topicId}
          totalIdeasCount={totalIdeasCount}
          topicCount={topicCounts[topicId] || 0}
          onTopicSelect={onTopicSelect}
        />
      ))}
    </>
  );
};

export default TopicsContent;
