import React, { memo, Suspense, useEffect, useState } from 'react';

import {
  Box,
  colors,
  Spinner,
  stylingConsts,
  Title,
  Tooltip,
} from '@citizenlab/cl2-component-library';
import { InfiniteData } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';

import {
  IAdminPublicationData,
  IAdminPublications,
} from 'api/admin_publications/types';
import useAdminPublications from 'api/admin_publications/useAdminPublications';
import useAuthUser from 'api/me/useAuthUser';

import useFeatureFlag from 'hooks/useFeatureFlag';

import NavigationTabs from 'components/admin/NavigationTabs';
import Tab from 'components/admin/NavigationTabs/Tab';
import Button from 'components/UI/Button';
import SearchInput from 'components/UI/SearchInput';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { isAdmin } from 'utils/permissions/roles';

import NonSortableProjectList from './Lists/NonSortableProjectList';
import SortableProjectList from './Lists/SortableProjectList';
import messages from './messages';

const Container = styled.div``;

const ListsContainer = styled.div`
  min-height: 80vh;
  padding-left: 36px;
  padding-right: 36px;
  padding-bottom: 36px;
  border: 1px solid ${colors.divider};
  border-radius: ${stylingConsts.borderRadius};
  background: ${colors.white};
`;

export interface Props {
  className?: string;
}

export type ActiveTab =
  | 'your-projects'
  | 'published'
  | 'draft'
  | 'archived'
  | 'pending'
  | 'all';

const getActiveTab = (pathname: string): ActiveTab => {
  if (pathname.includes('/admin/projects/all')) {
    return 'all';
  } else if (pathname.includes('/admin/projects/published')) {
    return 'published';
  } else if (pathname.includes('/admin/projects/draft')) {
    return 'draft';
  } else if (pathname.includes('/admin/projects/archived')) {
    return 'archived';
  } else if (pathname.includes('/admin/projects/pending')) {
    return 'pending';
  } else {
    return 'your-projects';
  }
};

const flattenPagesData = (
  data: InfiniteData<IAdminPublications> | undefined
): IAdminPublicationData[] | undefined => {
  return data?.pages
    .map((page: { data: IAdminPublicationData[] }) => page.data)
    .flat();
};

const AdminProjectsList = memo(({ className }: Props) => {
  const { formatMessage } = useIntl();
  const [search, setSearch] = useState<string>('');
  const { data: authUser } = useAuthUser();
  const isProjectFoldersEnabled = useFeatureFlag({ name: 'project_folders' });
  const isProjectReviewEnabled = useFeatureFlag({ name: 'project_review' });

  const userIsAdmin = isAdmin(authUser);

  const { data: moderatedAdminPublications } = useAdminPublications({
    publicationStatusFilter: ['published', 'draft', 'archived'],
    onlyProjects: true,
    filter_is_moderator_of: true,
    search,
  });

  const { data: publishedAdminPublications } = useAdminPublications({
    publicationStatusFilter: ['published'],
    onlyProjects: true,
    rootLevelOnly: false,
    search,
  });

  const { data: draftAdminPublications } = useAdminPublications({
    publicationStatusFilter: ['draft'],
    onlyProjects: true,
    rootLevelOnly: false,
    search,
  });

  const { data: archivedAdminPublications } = useAdminPublications({
    publicationStatusFilter: ['archived'],
    onlyProjects: true,
    rootLevelOnly: false,
    search,
  });

  const { data: pendingReviewAdminPublications } = useAdminPublications({
    publicationStatusFilter: ['draft'],
    review_state: 'pending',
    onlyProjects: true,
    rootLevelOnly: false,
    search,
  });

  const { data: allAdminPublications } = useAdminPublications({
    publicationStatusFilter: ['published', 'draft', 'archived'],
    // Admin publications in the "All" tab are shown in a flat list when there is a search query
    rootLevelOnly: !search || search.length === 0,
    search,
  });

  useEffect(() => {
    if (userIsAdmin) {
      clHistory.push('/admin/projects/all');
    }
  }, [userIsAdmin]);

  const { pathname } = useLocation();

  const activeTab = getActiveTab(pathname);

  const flatPublishedAdminPublications = flattenPagesData(
    publishedAdminPublications
  );
  const flatDraftAdminPublications = flattenPagesData(draftAdminPublications);
  const flatArchivedAdminPublications = flattenPagesData(
    archivedAdminPublications
  );
  const flatAllAdminPublications = flattenPagesData(allAdminPublications);

  const flatModeratedAdminPublications = flattenPagesData(
    moderatedAdminPublications
  );

  const flatPendingReviewAdminPublications = flattenPagesData(
    pendingReviewAdminPublications
  );

  return (
    <Container className={className}>
      <Box>
        <Box display="flex" justifyContent="space-between" mb="24px">
          <Box>
            <Title color="primary">
              <FormattedMessage {...messages.overviewPageTitle} />
            </Title>
          </Box>
          <Box
            display="flex"
            justifyContent="flex-end"
            gap="12px"
            alignItems="center"
          >
            {isProjectFoldersEnabled && (
              <Tooltip
                content={
                  <FormattedMessage {...messages.onlyAdminsCanCreateFolders} />
                }
                disabled={userIsAdmin}
              >
                <Box>
                  <Button
                    data-cy="e2e-new-project-folder-button"
                    linkTo={'/admin/projects/folders/new'}
                    buttonStyle="secondary-outlined"
                    icon="folder-add"
                    disabled={!userIsAdmin}
                  >
                    <FormattedMessage {...messages.createProjectFolder} />
                  </Button>
                </Box>
              </Tooltip>
            )}

            <Box>
              <Button
                data-cy="e2e-new-project-button"
                linkTo={'/admin/projects/new'}
                icon="plus-circle"
                buttonStyle="admin-dark"
              >
                <FormattedMessage {...messages.newProject} />
              </Button>
            </Box>
          </Box>
        </Box>
        <Box my="24px" w="fit-content">
          <SearchInput
            defaultValue={search}
            onChange={(search) => setSearch(search || '')}
            a11y_numberOfSearchResults={0}
            placeholder={formatMessage(messages.searchProjects)}
          />
        </Box>

        <Box
          w="100%"
          overflow="hidden"
          borderBottom={`1px solid ${colors.divider}`}
          position="relative"
          zIndex="1"
          mb="-2px"
        >
          <NavigationTabs position="relative">
            <Tab
              url="/admin/projects"
              label={`${formatMessage(messages.yourProjects)} (${
                flatModeratedAdminPublications?.length || 0
              })`}
              active={activeTab === 'your-projects'}
            />
            <Tab
              label={`${formatMessage(messages.publishedTab)} (${
                flatPublishedAdminPublications?.length || 0
              })`}
              active={activeTab === 'published'}
              url="/admin/projects/published"
            />
            <Tab
              label={`
                ${formatMessage(messages.draft)} (${
                flatDraftAdminPublications?.length || 0
              })`}
              active={activeTab === 'draft'}
              url="/admin/projects/draft"
            />
            <Tab
              label={`
                ${formatMessage(messages.archived)} (${
                flatArchivedAdminPublications?.length || 0
              })`}
              active={activeTab === 'archived'}
              url="/admin/projects/archived"
            />
            {isProjectReviewEnabled && isAdmin(authUser) && (
              <Tab
                label={`
                  ${formatMessage(messages.pendingReview)} (${
                  flatPendingReviewAdminPublications?.length || 0
                })`}
                active={activeTab === 'pending'}
                url="/admin/projects/pending"
              />
            )}

            <Tab
              label={formatMessage(messages.all)}
              active={activeTab === 'all'}
              url="/admin/projects/all"
            />
          </NavigationTabs>
        </Box>

        <ListsContainer>
          <Suspense fallback={<Spinner />}>
            {userIsAdmin && activeTab === 'all' && !search ? (
              <SortableProjectList
                adminPublications={flatAllAdminPublications}
              />
            ) : (
              <NonSortableProjectList
                search={search}
                activeTab={activeTab}
                adminPublications={
                  activeTab === 'your-projects'
                    ? flatModeratedAdminPublications
                    : activeTab === 'published'
                    ? flatPublishedAdminPublications
                    : activeTab === 'draft'
                    ? flatDraftAdminPublications
                    : activeTab === 'archived'
                    ? flatArchivedAdminPublications
                    : activeTab === 'pending'
                    ? flatPendingReviewAdminPublications
                    : flatAllAdminPublications
                }
              />
            )}
          </Suspense>
        </ListsContainer>
      </Box>
    </Container>
  );
});

export default AdminProjectsList;
