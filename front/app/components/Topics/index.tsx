import React from 'react';
import { Box, Spinner } from '@citizenlab/cl2-component-library';
import useTopics from 'api/topics/useTopics';
import Topic from './Topic';

interface Props {
  showHomePageTopcs?: boolean;
}

const Topics = ({ showHomePageTopcs = false }: Props) => {
  const { data: topics, isLoading } = useTopics({
    forHomepageFilter: showHomePageTopcs,
  });

  if (isLoading) {
    return <Spinner />;
  }

  return topics && topics.data.length > 0 ? (
    <Box display="flex" gap="20px" width="100%" flexWrap="wrap">
      {topics.data.map((topic) => (
        <Topic topic={topic} key={topic.id} />
      ))}
    </Box>
  ) : null;
};

export default Topics;
