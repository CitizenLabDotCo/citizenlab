import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { IProjectData } from 'api/projects/types';

import AreaFilterDropdown from './AreaFilterDropdown';
import ListingCard from './ListingCard';
import TopicTagsCard from './TopicTagsCard';

interface Props {
  project: IProjectData;
}

const SetupCards = ({ project }: Props) => (
  <Box>
    <ListingCard projectId={project.id} />
    <Box py="16px">
      <AreaFilterDropdown project={project} />
    </Box>
    <TopicTagsCard project={project} />
  </Box>
);

export default SetupCards;
