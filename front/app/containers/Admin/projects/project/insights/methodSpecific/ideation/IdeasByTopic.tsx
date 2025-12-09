import React, { useMemo } from 'react';

import { Box, Text, Spinner } from '@citizenlab/cl2-component-library';

import useIdeasFilterCounts from 'api/ideas_filter_counts/useIdeasFilterCounts';
import useTopics from 'api/topics/useTopics';

import useLocalize from 'hooks/useLocalize';

import { DEFAULT_CATEGORICAL_COLORS } from 'components/admin/Graphs/styling';

import { useIntl } from 'utils/cl-intl';

import HorizontalBarRow, {
  HorizontalBarRowData,
} from '../shared/HorizontalBarRow';

import messages from './messages';

interface Props {
  phaseId: string;
}

const IdeasByTopic = ({ phaseId }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();

  const { data: filterCounts, isLoading: isLoadingCounts } =
    useIdeasFilterCounts({
      phase: phaseId,
    });

  const { data: topics, isLoading: isLoadingTopics } = useTopics();

  const topicData = useMemo((): HorizontalBarRowData[] => {
    if (!filterCounts || !topics) return [];

    const countsByTopicId = filterCounts.data.attributes.topic_id;
    const totalIdeas = filterCounts.data.attributes.total;

    return topics.data
      .filter((topic) => countsByTopicId[topic.id] > 0)
      .map((topic) => ({
        id: topic.id,
        title: localize(topic.attributes.title_multiloc),
        count: countsByTopicId[topic.id],
        percentage:
          totalIdeas > 0
            ? ((countsByTopicId[topic.id] / totalIdeas) * 100).toFixed(1)
            : '0',
        color: '', // Will be assigned after sorting
      }))
      .sort((a, b) => b.count - a.count)
      .map((topic, index) => ({
        ...topic,
        color:
          DEFAULT_CATEGORICAL_COLORS[index % DEFAULT_CATEGORICAL_COLORS.length],
      }));
  }, [filterCounts, topics, localize]);

  const maxCount = useMemo(() => {
    if (topicData.length === 0) return 0;
    return Math.max(...topicData.map((t) => t.count));
  }, [topicData]);

  const isLoading = isLoadingCounts || isLoadingTopics;

  if (isLoading) {
    return (
      <Box
        w="50%"
        bgColor="white"
        borderRadius="8px"
        p="24px"
        boxShadow="0px 1px 2px 0px rgba(0,0,0,0.05)"
        h="400px"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Spinner size="24px" />
      </Box>
    );
  }

  if (topicData.length === 0) {
    return (
      <Box
        w="50%"
        bgColor="white"
        borderRadius="8px"
        p="24px"
        boxShadow="0px 1px 2px 0px rgba(0,0,0,0.05)"
        h="400px"
      >
        <Text m="0" mb="16px" fontWeight="semi-bold" fontSize="m">
          {formatMessage(messages.topicsAndThemes)}
        </Text>
        <Text m="0" color="textSecondary">
          {formatMessage(messages.noTopics)}
        </Text>
      </Box>
    );
  }

  return (
    <Box
      w="50%"
      bgColor="white"
      borderRadius="8px"
      p="24px"
      boxShadow="0px 1px 2px 0px rgba(0,0,0,0.05)"
      h="400px"
      display="flex"
      flexDirection="column"
    >
      <Box flexShrink={0}>
        <Text m="0" mb="16px" fontWeight="semi-bold" fontSize="m">
          {formatMessage(messages.topicsAndThemes)}
        </Text>
      </Box>
      <Box flex="1" overflow="auto">
        <Box display="flex" flexDirection="column" gap="16px">
          {topicData.map((topic) => (
            <HorizontalBarRow
              key={topic.id}
              data={topic}
              maxCount={maxCount}
              showPercentage
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default IdeasByTopic;
