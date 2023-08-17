import React from 'react';
import { Box } from '@citizenlab/cl2-component-library';
import useTopics from 'api/topics/useTopics';
import Topic from './Topic';

const Topics = () => {
  const { data: topics } = useTopics();

  return (
    <Box display="flex" gap="20px" width="100%" flexWrap="wrap">
      {topics?.data.map((topic) => (
        <Topic topic={topic} key={topic.id} />
      ))}
    </Box>
  );
};

export default Topics;
