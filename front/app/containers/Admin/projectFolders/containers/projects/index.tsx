import React from 'react';

import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import useAuthUser from 'api/me/useAuthUser';
import useProjectFolderById from 'api/project_folders/useProjectFolderById';

import { FormattedMessage } from 'utils/cl-intl';
import { isAdmin, isSpaceModerator } from 'utils/permissions/roles';

import messages from '../messages';

import ItemsInFolder from './ItemsInFolder';
import ItemsNotInFolder from './ItemsNotInFolder';
import { HeaderTitle } from './StyledComponents';

const Container = styled.div`
  min-height: 60vh;
`;

const ListsContainer = styled.div``;

const ListHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 25px;

  &:not(:first-child) {
    margin-top: 70px;
  }

  & + & {
    margin-top: 30px;
  }
`;

const StyledHeaderTitle = styled(HeaderTitle)`
  font-weight: bold;
`;

const Spacer = styled.div`
  flex: 1;
`;

const AdminFolderProjectsList = () => {
  const { projectFolderId } = useParams();
  const { data: authUser } = useAuthUser();
  const { data: folder } = useProjectFolderById(projectFolderId);

  if (!authUser || !folder) {
    return null;
  }

  const { space_id } = folder.data.attributes;

  const canAddAndRemoveProjectsFromFolder =
    isAdmin(authUser) || (space_id && isSpaceModerator(authUser, space_id));

  return (
    <Container>
      <ListsContainer>
        <ListHeader>
          <StyledHeaderTitle>
            <FormattedMessage {...messages.projectsAlreadyAdded} />
          </StyledHeaderTitle>
          <Spacer />
        </ListHeader>

        <ItemsInFolder projectFolderId={folder.data.id} />

        {canAddAndRemoveProjectsFromFolder && (
          <>
            <ListHeader>
              <StyledHeaderTitle>
                <FormattedMessage {...messages.projectsYouCanAdd} />
              </StyledHeaderTitle>
            </ListHeader>

            <ItemsNotInFolder folder={folder} />
          </>
        )}
      </ListsContainer>
    </Container>
  );
};

export default AdminFolderProjectsList;
