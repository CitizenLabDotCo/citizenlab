import React from 'react';

import {
  Box,
  Button,
  Divider,
  Text,
  colors,
} from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import useIdeasFilterCounts from 'api/ideas_filter_counts/useIdeasFilterCounts';
import usePhases from 'api/phases/usePhases';
import { getCurrentPhase } from 'api/phases/utils';
import useProjectBySlug from 'api/projects/useProjectBySlug';
import useTopics from 'api/topics/useTopics';

import useLocalize from 'hooks/useLocalize';

import GoBackButton from 'components/UI/GoBackButton';

import { getTopicColor } from './topicsColor';

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
  const topicColor = getTopicColor(topicId);

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
        <Text>{topicTitle}</Text>
        <Text variant="bodyS">{topicDescription}</Text>
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

  const { data: filterCounts } = useIdeasFilterCounts({
    projects: projectId ? [projectId] : undefined,
    phase: phaseId,
  });

  const localize = useLocalize();

  const totalIdeasCount = filterCounts?.data.attributes.total || 0;
  const topicCounts = filterCounts?.data.attributes.topic_id || {};
  if (topicsLoading || !projectId) {
    return null;
  }

  if (!topics || topics.data.length === 0) {
    return null;
  }

  return (
    <Box
      width="30%"
      background={colors.white}
      borderRight={`1px solid ${colors.grey300}`}
      py="20px"
      overflowY="auto"
    >
      <Box mb="24px">
        <GoBackButton linkTo={`/projects/${slug}`} />
      </Box>
      <Divider m="0px" />

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
    </Box>
  );
};

export default TopicsSidebar;
