import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';

// components
import PostManager from 'components/admin/PostManager';

// resources
import GetProjects, {
  GetProjectsChildProps,
  PublicationStatus,
} from 'resources/GetProjects';

export interface Props {
  projects: GetProjectsChildProps;
}

class IdeasTab extends PureComponent<Props> {
  render() {
    const { projects } = this.props;

    return (
      <>
        {projects && projects.projectsList !== undefined && (
          <PostManager
            type="AllIdeas"
            visibleFilterMenus={['projects', 'topics', 'statuses']}
            projects={projects.projectsList}
          />
        )}
      </>
    );
  }
}

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

export default () => <Data>{(dataProps) => <IdeasTab {...dataProps} />}</Data>;
