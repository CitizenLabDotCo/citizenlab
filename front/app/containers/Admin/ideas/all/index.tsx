import React, { memo } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// components
import PostManager, { TFilterMenu } from 'components/admin/PostManager';
import { Box, colors } from '@citizenlab/cl2-component-library';
import { PageTitle, SectionDescription } from 'components/admin/Section';

// resources
import GetProjects, { GetProjectsChildProps } from 'resources/GetProjects';
import { PublicationStatus } from 'api/projects/types';

import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

interface DataProps {
  projects: GetProjectsChildProps;
}

export interface Props extends DataProps {}

const IdeasTab = memo(({ projects }: Props) => {
  const defaultFilterMenu: TFilterMenu = 'projects';
  const visibleFilterMenus: TFilterMenu[] = [
    defaultFilterMenu,
    'topics',
    'statuses',
  ];

  if (!isNilOrError(projects)) {
    return (
      <>
        <PageTitle>
          <FormattedMessage {...messages.inputManagerPageTitle} />
        </PageTitle>
        <SectionDescription>
          <FormattedMessage {...messages.inputManagerPageSubtitle} />
        </SectionDescription>
        <Box background={colors.white} p="40px">
          <PostManager
            type="AllIdeas"
            defaultFilterMenu={defaultFilterMenu}
            visibleFilterMenus={visibleFilterMenus}
            projects={projects}
          />
        </Box>
      </>
    );
  }

  return null;
});

const publicationStatuses: PublicationStatus[] = [
  'draft',
  'published',
  'archived',
];

const Data = adopt<Props>({
  projects: (
    <GetProjects
      pageSize={250}
      sort="new"
      publicationStatuses={publicationStatuses}
      canModerate={true}
    />
  ),
});

export default () => (
  <Data>{(dataProps: DataProps) => <IdeasTab {...dataProps} />}</Data>
);
