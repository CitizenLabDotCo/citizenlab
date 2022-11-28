import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';
import { List, Row } from 'components/admin/ResourceList';
import ProjectRow from 'containers/Admin/projects/components/ProjectRow';
import Link from 'utils/cl-router/Link';
import Warning from 'components/UI/Warning';

// hooks
import useAdminPublications from 'hooks/useAdminPublications';
import { useParams } from 'react-router-dom';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { adminCustomPageSettingsPath } from '../../routes';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

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
