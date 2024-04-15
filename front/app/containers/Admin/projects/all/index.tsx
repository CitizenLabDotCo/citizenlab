import React, { memo, Suspense, useState } from 'react';

import { Box, Spinner, Title } from '@citizenlab/cl2-component-library';
import Tippy from '@tippyjs/react';
import styled from 'styled-components';

import useAuthUser from 'api/me/useAuthUser';

import useFeatureFlag from 'hooks/useFeatureFlag';

import PageWrapper from 'components/admin/PageWrapper';
import { SectionDescription } from 'components/admin/Section';
import Outlet from 'components/Outlet';
import Button from 'components/UI/Button';

import { FormattedMessage } from 'utils/cl-intl';
import { isAdmin } from 'utils/permissions/roles';
import { isProjectFolderModerator } from 'utils/permissions/rules/projectFolderPermissions';

import messages from './messages';

const NonSortableProjectList = React.lazy(
  () => import('./Lists/NonSortableProjectList')
);
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

  return (
    <Container className={className}>
      <CreateAndEditProjectsContainer
        className={containerOutletRendered ? 'hidden' : ''}
      >
        <Box display="flex" justifyContent="space-between">
          <Box>
            <Title color="primary">
              <FormattedMessage {...messages.overviewPageTitle} />
            </Title>

            <SectionDescription>
              <FormattedMessage {...messages.overviewPageSubtitle} />
            </SectionDescription>
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
        <PageWrapper>
          <ListsContainer>
            <Suspense fallback={<Spinner />}>
              {userIsAdmin ? (
                <SortableProjectList />
              ) : (
                <NonSortableProjectList />
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
