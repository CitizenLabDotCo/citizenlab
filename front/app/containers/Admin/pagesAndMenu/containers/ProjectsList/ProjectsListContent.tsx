import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';
import { List, Row } from 'components/admin/ResourceList';
import ProjectRow from 'containers/Admin/projects/components/ProjectRow';
import Link from 'utils/cl-router/Link';
import Warning from 'components/UI/Warning';

// hooks
import useAdminPublications from 'hooks/useAdminPublications';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { adminCustomPageSettingsPath } from '../../routes';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';
import { ICustomPageData } from 'services/customPages';

interface Props {
  customPage: ICustomPageData;
}

const ProjectsListContent = ({ customPage }: Props) => {
  // There will be either topic or area ids if this component renders.
  // To enable it, the page needs either a topic or area associated with it.
  const topicIds = customPage.relationships.topics.data.map(
    (topic) => topic.id
  );
  const areaIds = customPage.relationships.areas.data.map((area) => area.id);
  // Needs to be in sync with the projects list shown in
  // the projects list config of the custom page in the admin.
  // Comment reference to find it easily: 881dd218.
  const { list: adminPublicationsList } = useAdminPublications({
    topicIds,
    areaIds,
    publicationStatusFilter: ['published', 'archived'],
    onlyProjects: true,
  });

  if (isNilOrError(adminPublicationsList)) return null;

  if (customPage.attributes.projects_filter_type === 'no_filter') {
    return (
      <Box display="flex" flexDirection="column">
        <Box mb="28px">
          <Warning>
            <FormattedMessage {...messages.noFilter} />
          </Warning>
        </Box>
      </Box>
    );
  }

  const warningMessage =
    adminPublicationsList.length > 0
      ? messages.sectionDescription
      : messages.noAvailableProjects;

  return (
    <Box display="flex" flexDirection="column">
      <Box mb="28px">
        <Warning>
          <FormattedMessage
            {...warningMessage}
            values={{
              pageSettingsLink: (
                <Link to={`${adminCustomPageSettingsPath(customPage.id)}`}>
                  <FormattedMessage {...messages.pageSettingsLinkText} />
                </Link>
              ),
            }}
          />
        </Warning>
      </Box>
      <List>
        <>
          {adminPublicationsList.map((adminPublication, index: number) => (
            <Row
              id={adminPublication.id}
              isLastItem={index === adminPublicationsList.length - 1}
              key={adminPublication.id}
            >
              <ProjectRow
                publication={adminPublication}
                actions={['manage']}
                hideMoreActions
              />
            </Row>
          ))}
        </>
      </List>
    </Box>
  );
};

export default ProjectsListContent;
