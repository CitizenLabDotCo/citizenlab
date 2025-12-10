import React from 'react';

import {
  Box,
  Button,
  Divider,
  Text,
  colors,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import useIdeasFilterCounts from 'api/ideas_filter_counts/useIdeasFilterCounts';
import usePhases from 'api/phases/usePhases';
import { getCurrentPhase } from 'api/phases/utils';
import useProjectBySlug from 'api/projects/useProjectBySlug';
import { ITopics } from 'api/topics/types';
import useTopics from 'api/topics/useTopics';

import useLocalize from 'hooks/useLocalize';

import AvatarBubbles from 'components/AvatarBubbles';
import GoBackButton from 'components/UI/GoBackButton';

import BottomSheet from './BottomSheet';
import SelectedTopicView from './SelectedTopicView';
import { getTopicProgressBarColor } from './topicsColor';

interface TopicItemProps {
  topicId: string;
  topicTitle: string;
  topicDescription: string;
  isActive: boolean;
  totalIdeasCount: number;
  topicCount: number;
  onTopicSelect: (topicId: string) => void;
}

const StyledButton = styled(Button)`
  .buttonText {
    width: 100%;
  }
`;

const TopicItem: React.FC<TopicItemProps> = ({
  topicId,
  topicTitle,
  topicDescription,
  isActive,
  totalIdeasCount,
  topicCount,
  onTopicSelect,
}) => {
  const percentage =
    totalIdeasCount > 0 ? (topicCount / totalIdeasCount) * 100 : 0;
  const topicColor = getTopicProgressBarColor(topicId);

  return (
    <>
      <Box
        as={StyledButton}
        buttonStyle="secondary-outlined"
        background={isActive ? colors.teal100 : 'transparent'}
        onClick={() => onTopicSelect(topicId)}
        borderColor="transparent"
        justify="left"
      >
        <Text mb="0px">{topicTitle}</Text>
        <Text m="0px" variant="bodyS">
          {topicDescription}
        </Text>
        <Box mt="8px" w="100%">
          <Box
            width="100%"
            height="8px"
            borderRadius="4px"
            overflow="hidden"
            border={`1px solid ${colors.grey300}`}
          >
            <Box
              width={`${percentage}%`}
              height="100%"
              background={topicColor}
              style={{
                transition: 'width 0.3s ease',
                minWidth: topicCount > 0 ? '2%' : '0%',
              }}
            />
          </Box>

          <Text variant="bodyS">
            {topicCount} {topicCount === 1 ? 'idea' : 'ideas'}
          </Text>
        </Box>
      </Box>

      <Divider m="0px" />
    </>
  );
};

interface TopicsContentProps {
  topics: ITopics;
  selectedTopicId: string | null;
  onTopicSelect: (topicId: string | null) => void;
  totalIdeasCount: number;
  topicCounts: Record<string, number>;
  slug: string;
  showBackButton?: boolean;
}

const TopicsContent: React.FC<TopicsContentProps> = ({
  topics,
  selectedTopicId,
  onTopicSelect,
  totalIdeasCount,
  topicCounts,
  slug,
  showBackButton = true,
}) => {
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
      />
    );
  }

  return (
    <>
      {showBackButton && (
        <Box mb="24px">
          <GoBackButton linkTo={`/projects/${slug}`} size="s" />
        </Box>
      )}

      <Box px="16px" mb="16px">
        <Text fontWeight="bold" variant="bodyL" mb="8px">
          {projectTitle}
        </Text>
        {projectId && (
          <AvatarBubbles
            context={{ type: 'project', id: projectId }}
            size={28}
          />
        )}
      </Box>

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

interface Props {
  selectedTopicId: string | null;
  onTopicSelect: (topicId: string | null) => void;
}

const TopicsSidebar: React.FC<Props> = ({ selectedTopicId, onTopicSelect }) => {
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
      <BottomSheet>
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
