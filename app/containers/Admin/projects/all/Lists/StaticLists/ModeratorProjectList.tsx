import React, { memo } from 'react';
import { adopt } from 'react-adopt';

// utils
import { isNilOrError } from 'utils/helperUtils';

// resources
import GetProjects, { GetProjectsChildProps } from 'resources/GetProjects';

// components
import { List, Row } from 'components/admin/ResourceList';
import ProjectRow from '../../../components/ProjectRow';

interface DataProps {
  publishedProjectsUserCanModerate: GetProjectsChildProps;
}

const ModeratorProjectList = memo<DataProps>(({ publishedProjectsUserCanModerate: { projectsList } }) => {
  if (!isNilOrError(projectsList)) {
    return (
      <List>
        {projectsList.map((project, index) => {
            return (
              <Row
                key={index}
                id={project.id}
                lastItem={(index === projectsList.length - 1)}
              >
                <ProjectRow project={project} />
              </Row>
            );
          }
        )}
      </List>
    );
  }

  return null;
});

const Data = adopt<DataProps>({
  publishedProjectsUserCanModerate: <GetProjects publicationStatuses={['published']} filterCanModerate={true} />,
});

export default () => (
  <Data>
    {dataProps => <ModeratorProjectList {...dataProps} />}
  </Data>
);
