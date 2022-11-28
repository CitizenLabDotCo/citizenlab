import React from 'react';

// components
import { List, Row } from 'components/admin/ResourceList';
import ProjectRow from 'containers/Admin/projects/components/ProjectRow';
import { Box } from '@citizenlab/cl2-component-library';
import Link from 'utils/cl-router/Link';
import Warning from 'components/UI/Warning';

import { adminCustomPageSettingsPath } from '../../routes';

// hooks
import useAdminPublications from 'hooks/useAdminPublications';
import { FormattedMessage } from 'utils/cl-intl';
import { useParams } from 'react-router-dom';

// utils
// import { pagesAndMenuBreadcrumb } from '../../breadcrumbs';
import { isNilOrError } from 'utils/helperUtils';
// i18n
import messages from './messages';

const ProjectsListContent = ({
  areaIds,
  topicIds,
}: {
  areaIds: string[];
  topicIds: string[];
}) => {
  const { list: adminPublications } = useAdminPublications({
    topicFilter: topicIds,
    areaFilter: areaIds,
    publicationStatusFilter: ['published'],
    rootLevelOnly: true,
  });

  const { customPageId } = useParams() as { customPageId: string };

  if (isNilOrError(adminPublications)) return null;

  return (
    <Box display="flex" flexDirection="column">
      <Box mb="28px">
        <Warning>
          {adminPublications.length > 0 ? (
            <FormattedMessage
              {...messages.sectionDescription}
              values={{
                pageSettingsLink: (
                  <Link to={`${adminCustomPageSettingsPath(customPageId)}`}>
                    <FormattedMessage {...messages.pageSettingsLinkText} />
                  </Link>
                ),
              }}
            />
          ) : (
            <FormattedMessage
              {...messages.noAvailableProjects}
              values={{
                pageSettingsLink: (
                  <Link to={`${adminCustomPageSettingsPath(customPageId)}`}>
                    <FormattedMessage {...messages.pageSettingsLinkText} />
                  </Link>
                ),
              }}
            />
          )}
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
