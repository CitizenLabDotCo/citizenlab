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
import IconTooltip from 'components/UI/IconTooltip';

// services
import { getFilteredProjects } from 'services/projects';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

interface DataProps {
  projects: GetProjectsChildProps;
}

interface Props extends DataProps {}

const ModeratorProjectList = memo<Props>(({ projects }) => {
  if (
    !isNilOrError(projects) &&
    projects.projectsList &&
    projects.projectsList.length > 0
  ) {
    const { projectsList } = projects;
    const publishedProjects = getFilteredProjects(projectsList, 'published');
    const archivedProjects = getFilteredProjects(projectsList, 'archived');
    const draftProjects = getFilteredProjects(projectsList, 'draft');

    return (
      <>
        {publishedProjects && publishedProjects.length > 0 &&
          <>
            <ListHeader>
              <HeaderTitle>
                <FormattedMessage {...messages.published} />
              </HeaderTitle>
              <IconTooltip content={<FormattedMessage {...messages.publishedTooltip} />} />
            </ListHeader>
            <List>
              {publishedProjects.map((project, index) => {
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
          </>
        }
        {draftProjects && draftProjects.length > 0 &&
          <>
            <ListHeader>
              <HeaderTitle>
                <FormattedMessage {...messages.draft} />
              </HeaderTitle>
              <IconTooltip content={<FormattedMessage {...messages.draftTooltip} />} />
            </ListHeader>
            <List>
              {draftProjects.map((project, index) => (
                <Row key={project.id} lastItem={(index === draftProjects.length - 1)}>
                  <ProjectRow project={project} />
                </Row>
              ))}
            </List>
          </>
        }
        {archivedProjects && archivedProjects.length > 0 &&
          <>
            <ListHeader>
              <HeaderTitle>
                <FormattedMessage {...messages.archived} />
              </HeaderTitle>
              <IconTooltip content={<FormattedMessage {...messages.archivedTooltip} />} />
            </ListHeader>
            <List>
              {archivedProjects.map((project, index) => (
                <Row
                  key={project.id}
                  lastItem={(index === archivedProjects.length - 1)}
                >
                  <ProjectRow project={project} />
                </Row>
              ))}
            </List>
          </>
        }
      </>
    );
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
