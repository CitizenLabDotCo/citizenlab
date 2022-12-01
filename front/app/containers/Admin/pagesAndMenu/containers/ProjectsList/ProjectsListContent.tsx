import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';
import { List, Row } from 'components/admin/ResourceList';
import ProjectRow from 'containers/Admin/projects/components/ProjectRow';
import Link from 'utils/cl-router/Link';
import Warning from 'components/UI/Warning';

// hooks
import useAdminPublications from 'hooks/useAdminPublications';
import useCustomPage from 'hooks/useCustomPage';
import { useParams } from 'react-router-dom';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { adminCustomPageSettingsPath } from '../../routes';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';
import { ICustomPageData } from 'services/customPages';

interface Props {
  page: ICustomPageData;
}

const ProjectsListContent = ({ page }: Props) => {
  const areaIds = page.relationships.areas.data.map((area) => area.id);
  const topicIds = page.relationships.topics.data.map((topic) => topic.id);
  // Needs to be in sync with the projects list shown on the
  // the citizen-facing custom page.
  // Comment reference to find it easily: 881dd218.
  const { list: adminPublications } = useAdminPublications({
    topicIds,
    areaIds,
    publicationStatusFilter: ['published', 'archived'],
  });

  const { customPageId } = useParams() as { customPageId: string };
  const customPage = useCustomPage({ customPageId });

  if (isNilOrError(adminPublications) || isNilOrError(customPage)) return null;

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
    adminPublications.length > 0
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
                <Link to={`${adminCustomPageSettingsPath(customPageId)}`}>
                  <FormattedMessage {...messages.pageSettingsLinkText} />
                </Link>
              ),
            }}
          />
        </Warning>
      </Box>
      <List>
        {adminPublications.map((adminPublication, index: number) => (
          <Row
            id={adminPublication.id}
            isLastItem={index === adminPublications.length - 1}
            key={adminPublication.id}
          >
            <ProjectRow publication={adminPublication} actions={['manage']} />
          </Row>
        ))}
      </List>
    </Box>
  );
};

export default ProjectsListContent;
