import React, { memo, Suspense, useState } from 'react';

import { Box, Spinner, Title } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useAuthUser from 'api/me/useAuthUser';

import useFeatureFlag from 'hooks/useFeatureFlag';

import PageWrapper from 'components/admin/PageWrapper';
import { SectionDescription } from 'components/admin/Section';
import Outlet from 'components/Outlet';
import Button from 'components/UI/Button';

import { FormattedMessage } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';
import { isAdmin } from 'utils/permissions/roles';

import messages from './messages';

const ModeratorProjectList = React.lazy(
  () => import('./Lists/ModeratorProjectList')
);
const AdminProjectList = React.lazy(() => import('./Lists/AdminProjectList'));

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
  const userIsAdmin = !isNilOrError(authUser) ? isAdmin(authUser) : false;

  const [containerOutletRendered, setContainerOutletRendered] = useState(false);
  const handleContainerOutletOnRender = (hasRendered: boolean) => {
    setContainerOutletRendered(hasRendered);
  };

  const isProjectFoldersEnabled = useFeatureFlag({ name: 'project_folders' });

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
          <Box display="flex" justifyContent="flex-end" gap="24px">
            {isProjectFoldersEnabled && (
              <Button
                data-cy="e2e-new-project-folder-button"
                linkTo={'/admin/projects/folders/new'}
                buttonStyle="secondary-outlined"
                icon="folder-add"
              >
                <FormattedMessage {...messages.createProjectFolder} />
              </Button>
            )}

            <Button
              linkTo={'/admin/projects/new-project'}
              icon="plus-circle"
              buttonStyle="admin-dark"
            >
              <FormattedMessage {...messages.newProject} />
            </Button>
          </Box>
        </Box>
        <PageWrapper>
          <ListsContainer>
            <Suspense fallback={<Spinner />}>
              {userIsAdmin ? <AdminProjectList /> : <ModeratorProjectList />}
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
