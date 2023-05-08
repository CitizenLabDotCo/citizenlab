import React, { memo } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// components
import PostManager, { TFilterMenu } from 'components/admin/PostManager';

// resources
import GetProjects, { GetProjectsChildProps } from 'resources/GetProjects';
import { PublicationStatus } from 'services/projects';

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
      <PostManager
        type="AllIdeas"
        defaultFilterMenu={defaultFilterMenu}
        visibleFilterMenus={visibleFilterMenus}
        projects={projects}
      />
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
