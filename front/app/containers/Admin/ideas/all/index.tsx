import React from 'react';

import { Box, Title, colors, Spinner } from '@citizenlab/cl2-component-library';

import { PublicationStatus } from 'api/projects/types';
import useProjects from 'api/projects/useProjects';

import InputManager from 'components/admin/PostManager/InputManager';
import { SectionDescription } from 'components/admin/Section';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';

const IdeasTab = () => {
  const { data: projects, isLoading } = useProjects({
    pageSize: 250,
    sort: 'new',
    publicationStatuses,
    canModerate: true,
  });

  return (
    <>
      <Title color="primary">
        <FormattedMessage {...messages.inputManagerPageTitle} />
      </Title>
      <SectionDescription>
        <FormattedMessage {...messages.inputManagerPageSubtitle} />
      </SectionDescription>
      <Box background={colors.white} p="40px">
        {isLoading && (
          <Box mb="28px">
            <Spinner />
          </Box>
        )}
        <InputManager
          visibleFilterMenus={['projects', 'statuses']}
          defaultFilterMenu="projects"
          projects={projects?.data}
        />
      </Box>
    </>
  );
};

const publicationStatuses: PublicationStatus[] = [
  'draft',
  'published',
  'archived',
];

export default IdeasTab;
