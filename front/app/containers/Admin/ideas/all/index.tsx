import React from 'react';

// components
import PostManager, { TFilterMenu } from 'components/admin/PostManager';
import { Box, Title, colors } from '@citizenlab/cl2-component-library';
import { SectionDescription } from 'components/admin/Section';

// resources
import { PublicationStatus } from 'api/projects/types';

import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';
import useProjects from 'api/projects/useProjects';

const IdeasTab = () => {
  const defaultFilterMenu: TFilterMenu = 'projects';
  const visibleFilterMenus: TFilterMenu[] = [
    defaultFilterMenu,
    'topics',
    'statuses',
  ];
  const { data: projects } = useProjects({
    pageSize: 250,
    sort: 'new',
    publicationStatuses,
    canModerate: true,
  });

  if (projects) {
    return (
      <>
        <Title color="primary">
          <FormattedMessage {...messages.inputManagerPageTitle} />
        </Title>
        <SectionDescription>
          <FormattedMessage {...messages.inputManagerPageSubtitle} />
        </SectionDescription>
        <Box background={colors.white} p="40px">
          <PostManager
            type="AllIdeas"
            defaultFilterMenu={defaultFilterMenu}
            visibleFilterMenus={visibleFilterMenus}
            projects={projects.data}
          />
        </Box>
      </>
    );
  }

  return null;
};

const publicationStatuses: PublicationStatus[] = [
  'draft',
  'published',
  'archived',
];

export default IdeasTab;
