import React from 'react';
import { Box, Spinner } from '@citizenlab/cl2-component-library';
import useTopics from 'api/topics/useTopics';
import UpdateFollowTopic from './UpdateFollowTopic';
import UpdateOnboardingTopic from './UpdateOnboardingTopic';

interface Props {
  showOnboardingTopics?: boolean;
  action?: 'updateFollowPreferences' | 'updateOnboardingPreferences';
}

const Topics = ({
  showOnboardingTopics,
  action = 'updateFollowPreferences',
}: Props) => {
  const { data: topics, isLoading } = useTopics({
    forOnboarding: showOnboardingTopics,
    sort: 'projects_count',
  });

  if (isLoading) {
    return <Spinner />;
  }

  return topics && topics.data.length > 0 ? (
    <Box display="flex" gap="20px" width="100%" flexWrap="wrap">
      {topics.data.map((topic) => {
        return action === 'updateOnboardingPreferences' ? (
          <UpdateOnboardingTopic key={topic.id} topic={topic} />
        ) : (
          <UpdateFollowTopic key={topic.id} topic={topic} />
        );
      })}
    </Box>
  ) : null;
};

export default Topics;
