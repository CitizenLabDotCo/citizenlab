import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import useAdminPublications from 'api/admin_publications/useAdminPublications';
import { ICustomPageData } from 'api/custom_pages/types';

import { List } from 'components/admin/ResourceList';
import Warning from 'components/UI/Warning';

import { FormattedMessage } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import { isNilOrError } from 'utils/helperUtils';

import { adminCustomPageSettingsPath } from '../../routes';

import messages from './messages';
import Project from './Project';

interface Props {
  customPage: ICustomPageData;
}

const ProjectsListContent = ({ customPage }: Props) => {
  // There will be either topic or area ids if this component renders.
  // To enable it, the page needs either a topic or area associated with it.
  const topicIds = customPage.relationships.global_topics.data.map(
    (topic) => topic.id
  );
  const areaIds = customPage.relationships.areas.data.map((area) => area.id);
  // Needs to be in sync with the projects list shown in
  // the projects list config of the custom page in the admin.
  // Comment reference to find it easily: 881dd218.

  const { data } = useAdminPublications({
    globalTopicIds: topicIds,
    areaIds,
    publicationStatusFilter: ['published', 'archived'],
    onlyProjects: true,
    remove_all_unlisted: true,
  });

  const adminPublicationsList = data?.pages.map((page) => page.data).flat();

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
            <Project
              adminPublication={adminPublication}
              isLastItem={index === adminPublicationsList.length - 1}
              key={adminPublication.id}
            />
          ))}
        </>
      </List>
    </Box>
  );
};

export default ProjectsListContent;
