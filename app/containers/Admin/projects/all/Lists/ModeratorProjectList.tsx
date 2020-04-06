import React, { memo } from 'react';
import { adopt } from 'react-adopt';

// utils
import { isNilOrError } from 'utils/helperUtils';

// resources
import GetProjects, { GetProjectsChildProps, PublicationStatus } from 'resources/GetProjects';

// components
import { List, Row } from 'components/admin/ResourceList';
import ProjectRow from '../../components/ProjectRow';
import { ListHeader, HeaderTitle } from '../StyledComponents';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';
import GetAdminPublication from 'resources/GetAdminPublication';

interface DataProps {
  projects: GetProjectsChildProps;
}

interface Props extends DataProps { }

const ModeratorProjectList = memo<Props>(({ projects }) => {
  if (
    !isNilOrError(projects) &&
    projects.projectsList &&
    projects.projectsList.length > 0
  ) {
    const { projectsList } = projects;

    if (projectsList && projectsList.length > 0) {
      return (
        <>
          <ListHeader>
            <HeaderTitle>
              <FormattedMessage {...messages.existingProjects} />
            </HeaderTitle>
          </ListHeader>

          <List>
            {projectsList.map((project, index) => {
              return (
                <Row
                  key={index}
                  id={project.id}
                  lastItem={(index === projectsList.length - 1)}
                >
                  <GetAdminPublication adminPublicationId={project.relationships.admin_publication ?.data ?.id || null}>
                    {({ adminPublication }) => !isNilOrError(adminPublication) ? <ProjectRow publication={{ ...adminPublication, publicationId: project.id, publicationType: 'project' }} /> : null}
                  </GetAdminPublication>
                </Row>
              );
            }
            )}
          </List>
        </>
      );
    }
  }

  return null;
});

const publicationStatuses: PublicationStatus[] = ['published', 'draft', 'archived'];

const Data = adopt<DataProps>({
  projects: <GetProjects publicationStatuses={publicationStatuses} filterCanModerate={true} />,
});

export default () => (
  <Data>
    {dataProps => <ModeratorProjectList {...dataProps} />}
  </Data>
);
