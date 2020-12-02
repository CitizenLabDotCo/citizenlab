import React, { memo } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// components
import PostManager from 'components/admin/PostManager';

// resources
import GetProjects, {
  GetProjectsChildProps,
  PublicationStatus,
} from 'resources/GetProjects';

interface DataProps {
  projects: GetProjectsChildProps;
}

export interface Props extends DataProps {}

const IdeasTab = memo(({ projects }: Props) => {
  if (!isNilOrError(projects) && projects.projectsList !== undefined) {
    return (
      <PostManager
        type="AllIdeas"
        visibleFilterMenus={['projects', 'topics', 'statuses']}
        projects={projects.projectsList}
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
      filterCanModerate={true}
    />
  ),
});

export default () => (
  <Data>{(dataProps: DataProps) => <IdeasTab {...dataProps} />}</Data>
);
