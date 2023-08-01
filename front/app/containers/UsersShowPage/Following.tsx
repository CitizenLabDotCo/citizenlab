import React, { useState } from 'react';
import { Box } from '@citizenlab/cl2-component-library';
import useFollowers from 'api/follow_unfollow/useFollowers';
import IdeaCard from 'components/IdeaCard';
import { FollowableObject } from 'api/follow_unfollow/types';
import InitiativeCard from 'components/InitiativeCard';
import ProjectCard from 'components/ProjectCard';
import FilterSelector from 'components/FilterSelector';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

const options = [
  { text: <FormattedMessage {...messages.projects} />, value: 'Project' },
  { text: <FormattedMessage {...messages.initiatives} />, value: 'Initiative' },
  { text: <FormattedMessage {...messages.ideas} />, value: 'Idea' },
];

const Following = () => {
  const [selectedValue, setSelectedValue] =
    useState<FollowableObject>('Project');
  const { data: followers } = useFollowers({ followableObject: selectedValue });
  const handleOnChange = (selectedValue) => {
    setSelectedValue(selectedValue[0]);
  };

  return (
    <Box display="flex" w="100%" flexDirection="column">
      <Box mb="16px" w="100%" display="flex" justifyContent="flex-end">
        <FilterSelector
          title={<FormattedMessage {...messages.projects} />}
          name="sort"
          selected={[selectedValue]}
          values={options}
          onChange={handleOnChange}
          multipleSelectionAllowed={false}
          width="180px"
        />
      </Box>
      <Box display="flex" flexWrap="wrap" gap="20px">
        {followers?.data.map((follower) => (
          <>
            {follower.relationships.followable.data.type === 'idea' && (
              <Box width="calc(50% - 20px)">
                <IdeaCard ideaId={follower.relationships.followable.data.id} />
              </Box>
            )}
            {follower.relationships.followable.data.type === 'initiative' && (
              <Box width="calc(100% * (1 / 3) - 26px)">
                <InitiativeCard
                  initiativeId={follower.relationships.followable.data.id}
                />
              </Box>
            )}
            {follower.relationships.followable.data.type === 'project' && (
              <ProjectCard
                projectId={follower.relationships.followable.data.id}
                size="small"
              />
            )}
          </>
        ))}
      </Box>
    </Box>
  );
};

export default Following;
