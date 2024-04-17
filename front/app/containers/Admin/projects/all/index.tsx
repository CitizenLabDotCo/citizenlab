import React, { memo, Suspense, useState } from 'react';

import { Box, Spinner, Title } from '@citizenlab/cl2-component-library';
import { InfiniteData } from '@tanstack/react-query';
import Tippy from '@tippyjs/react';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';

import { IAdminPublications } from 'api/admin_publications/types';
import useAdminPublications from 'api/admin_publications/useAdminPublications';
import useAuthUser from 'api/me/useAuthUser';

import useFeatureFlag from 'hooks/useFeatureFlag';

import NavigationTabs from 'components/admin/NavigationTabs';
import Tab from 'components/admin/NavigationTabs/Tab';
import PageWrapper from 'components/admin/PageWrapper';
import Outlet from 'components/Outlet';
import Button from 'components/UI/Button';
import SearchInput from 'components/UI/SearchInput';

import { FormattedMessage } from 'utils/cl-intl';
import { isAdmin } from 'utils/permissions/roles';
import { isProjectFolderModerator } from 'utils/permissions/rules/projectFolderPermissions';

import NonSortableProjectList from './Lists/NonSortableProjectList';
import SortableProjectList from './Lists/SortableProjectList';
import messages from './messages';

const Container = styled.div``;

const CreateAndEditProjectsContainer = styled.div`
  &.hidden {
    display: none;
  }
`;

const ListsContainer = styled.div`
  min-height: 80vh;
`;

export const ListHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 25px;

  & ~ & {
    margin-top: 70px;
  }
`;

export interface Props {
  className?: string;
}

const getActiveTab = (pathname: string) => {
  if (pathname.includes('/admin/projects/your-projects')) {
    return 'your-projects';
  } else if (pathname.includes('/admin/projects/published')) {
    return 'published';
  } else if (pathname.includes('/admin/projects/draft')) {
    return 'draft';
  } else if (pathname.includes('/admin/projects/archived')) {
    return 'archived';
  } else {
    return 'all';
  }
};

const flattenPagesData = (
  data: InfiniteData<IAdminPublications> | undefined
) => {
  return data?.pages.map((page: any) => page.data).flat();
};

const AdminProjectsList = memo(({ className }: Props) => {
  const [search, setSearch] = useState<string>('');
  const { data: authUser } = useAuthUser();
  const isProjectFoldersEnabled = useFeatureFlag({ name: 'project_folders' });
  const userIsAdmin = isAdmin(authUser);
  const userIsFolderModerator =
    (authUser &&
      isProjectFoldersEnabled &&
      isProjectFolderModerator(authUser.data)) ??
    false;
  const userCanCreateProject = userIsAdmin || userIsFolderModerator;
  const [containerOutletRendered, setContainerOutletRendered] = useState(false);

  const { data: yourAdminPublications } = useAdminPublications({
    publicationStatusFilter: ['published', 'draft', 'archived'],
    onlyProjects: true,
    filter_can_moderate: true,
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

  const { data: allAdminPublications } = useAdminPublications({
    publicationStatusFilter: ['published', 'draft', 'archived'],
    rootLevelOnly: !search || search.length === 0,
    search,
  });

  const handleContainerOutletOnRender = (hasRendered: boolean) => {
    setContainerOutletRendered(hasRendered);
  };

  const { pathname } = useLocation();

  const activeTab = getActiveTab(pathname);

  return (
    <Container className={className}>
      <CreateAndEditProjectsContainer
        className={containerOutletRendered ? 'hidden' : ''}
      >
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
              <Tippy
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
              </Tippy>
            )}
            <Tippy
              content={
                <FormattedMessage {...messages.onlyAdminsCanCreateProjects} />
              }
              disabled={userCanCreateProject}
            >
              <Box>
                <Button
                  data-cy="e2e-new-project-button"
                  linkTo={'/admin/projects/new'}
                  icon="plus-circle"
                  buttonStyle="admin-dark"
                  disabled={!userCanCreateProject}
                >
                  <FormattedMessage {...messages.newProject} />
                </Button>
              </Box>
            </Tippy>
          </Box>
        </Box>
        <Box my="24px" w="fit-content">
          <SearchInput
            defaultValue={search}
            onChange={(search) => setSearch(search || '')}
            a11y_numberOfSearchResults={0}
            placeholder="Search projects"
          />
        </Box>
        <Box w="100%" overflow="hidden">
          <NavigationTabs position="relative">
            <Tab
              url="/admin/projects/your-projects"
              label={`Your projects (${
                flattenPagesData(yourAdminPublications)?.length || ''
              })`}
              active={activeTab === 'your-projects'}
            />
            <Tab
              label={`Active (${
                flattenPagesData(publishedAdminPublications)?.length
              })`}
              active={activeTab === 'published'}
              url="/admin/projects/published"
            />
            <Tab
              label={`Draft (${
                flattenPagesData(draftAdminPublications)?.length
              })`}
              active={activeTab === 'draft'}
              url="/admin/projects/draft"
            />
            <Tab
              label={`Archived (${
                flattenPagesData(archivedAdminPublications)?.length
              })`}
              active={activeTab === 'archived'}
              url="/admin/projects/archived"
            />
            <Tab
              label={'All'}
              active={activeTab === 'all'}
              url="/admin/projects"
            />
          </NavigationTabs>
        </Box>
        <PageWrapper>
          <ListsContainer>
            <Suspense fallback={<Spinner />}>
              {userIsAdmin && activeTab === 'all' ? (
                <SortableProjectList
                  search={search}
                  adminPublications={allAdminPublications}
                />
              ) : (
                <NonSortableProjectList
                  search={search}
                  adminPublications={
                    activeTab === 'your-projects'
                      ? yourAdminPublications
                      : activeTab === 'published'
                      ? publishedAdminPublications
                      : activeTab === 'draft'
                      ? draftAdminPublications
                      : activeTab === 'archived'
                      ? archivedAdminPublications
                      : allAdminPublications
                  }
                />
              )}
            </Suspense>
          </ListsContainer>
        </PageWrapper>
      </CreateAndEditProjectsContainer>
      <Outlet
        id="app.containers.Admin.projects.all.container"
        onRender={handleContainerOutletOnRender}
      />
    </Container>
  );
});

export default AdminProjectsList;
