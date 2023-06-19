import React, { memo } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// components
import PostManager, { TFilterMenu } from 'components/admin/PostManager';
import { Box, Text, colors } from '@citizenlab/cl2-component-library';

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
        <Box mb="28px">
          <Text color="coolGrey600">
            <FormattedMessage {...messages.inputManagerPageSubtitle} />
          </Text>
        </Box>
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
