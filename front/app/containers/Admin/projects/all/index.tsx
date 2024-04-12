import React, { memo, Suspense, useState } from 'react';

import { Spinner, Title } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useAuthUser from 'api/me/useAuthUser';

import useFeatureFlag from 'hooks/useFeatureFlag';

import PageWrapper from 'components/admin/PageWrapper';
import { SectionDescription } from 'components/admin/Section';
import Outlet from 'components/Outlet';

import { FormattedMessage } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';
import { isAdmin } from 'utils/permissions/roles';
import { isProjectFolderModerator } from 'utils/permissions/rules/projectFolderPermissions';

import CreateProject from './CreateProject';
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

const CreateProjectWrapper = styled.div`
  margin-bottom: 18px;
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
  const userIsFolderModerator = !isNilOrError(authUser)
    ? isProjectFolderModerator(authUser.data)
    : false;
  const isProjectFoldersEnabled = useFeatureFlag({ name: 'project_folders' });
  const [containerOutletRendered, setContainerOutletRendered] = useState(false);
  const handleContainerOutletOnRender = (hasRendered: boolean) => {
    setContainerOutletRendered(hasRendered);
  };

  return (
    <Container className={className}>
      <CreateAndEditProjectsContainer
        className={containerOutletRendered ? 'hidden' : ''}
      >
        <Title color="primary">
          <FormattedMessage {...messages.overviewPageTitle} />
        </Title>

        <SectionDescription>
          <FormattedMessage {...messages.overviewPageSubtitle} />
        </SectionDescription>

        <CreateProjectWrapper>
          {(userIsAdmin ||
            (userIsFolderModerator && isProjectFoldersEnabled)) && (
            <CreateProject />
          )}
        </CreateProjectWrapper>

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
