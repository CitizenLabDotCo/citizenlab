import React, { memo, Suspense, useState } from 'react';

import { Box, Spinner, Title } from '@citizenlab/cl2-component-library';
import Tippy from '@tippyjs/react';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';

import useAuthUser from 'api/me/useAuthUser';

import useFeatureFlag from 'hooks/useFeatureFlag';

import NavigationTabs from 'components/admin/NavigationTabs';
import Tab from 'components/admin/NavigationTabs/Tab';
import PageWrapper from 'components/admin/PageWrapper';
import Outlet from 'components/Outlet';
import Button from 'components/UI/Button';

import { FormattedMessage } from 'utils/cl-intl';
import { isAdmin } from 'utils/permissions/roles';
import { isProjectFolderModerator } from 'utils/permissions/rules/projectFolderPermissions';

import NonSortableProjectList from './Lists/NonSortableProjectList';
import messages from './messages';

const SortableProjectList = React.lazy(
  () => import('./Lists/SortableProjectList')
);

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

const AdminProjectsList = memo(({ className }: Props) => {
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
  const handleContainerOutletOnRender = (hasRendered: boolean) => {
    setContainerOutletRendered(hasRendered);
  };

  const { pathname } = useLocation();

  const activeTab = (() => {
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
  })();

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
        <Box w="100%" overflow="hidden">
          <NavigationTabs position="relative">
            <Tab
              url="/admin/projects/your-projects"
              label={'Your projects'}
              active={activeTab === 'your-projects'}
            />
            <Tab
              label={'Active'}
              active={activeTab === 'published'}
              url="/admin/projects/published"
            />
            <Tab
              label={'Draft'}
              active={activeTab === 'draft'}
              url="/admin/projects/draft"
            />
            <Tab
              label={'Archived'}
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
                <SortableProjectList />
              ) : (
                <NonSortableProjectList
                  publicationStatusFilter={
                    activeTab === 'all' || activeTab === 'your-projects'
                      ? ['published', 'draft', 'archived']
                      : [activeTab]
                  }
                  moderator={activeTab === 'your-projects'}
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
