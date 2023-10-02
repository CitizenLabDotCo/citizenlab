import React from 'react';

// components
import PostManager, { TFilterMenu } from 'components/admin/PostManager';
import { Box, Title, colors, Spinner } from '@citizenlab/cl2-component-library';
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
        {isLoading && <Spinner />}
        <PostManager
          type="AllIdeas"
          defaultFilterMenu={defaultFilterMenu}
          visibleFilterMenus={visibleFilterMenus}
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
