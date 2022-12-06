import React from 'react';
// style
import styled from 'styled-components';
// hooks
import useAuthUser from 'hooks/useAuthUser';
// services
import { isAdmin } from 'services/permissions/roles';
// localisation
import { FormattedMessage } from 'utils/cl-intl';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';
import { isNilOrError } from 'utils/helperUtils';
// components
import { HeaderTitle } from 'containers/Admin/projects/all/StyledComponents';
import messages from '../messages';
import ItemsInFolder from './ItemsInFolder';
import ItemsNotInFolder from './ItemsNotInFolder';

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

const AdminFolderProjectsList = ({
  params: { projectFolderId },
}: WithRouterProps) => {
  const authUser = useAuthUser();

  if (isNilOrError(authUser)) {
    return null;
  }

  const userIsAdmin = authUser && isAdmin({ data: authUser });

  return (
    <Container>
      <ListsContainer>
        <ListHeader>
          <StyledHeaderTitle>
            <FormattedMessage {...messages.projectsAlreadyAdded} />
          </StyledHeaderTitle>
          <Spacer />
        </ListHeader>

        <ItemsInFolder projectFolderId={projectFolderId} />

        {userIsAdmin && (
          <>
            <ListHeader>
              <StyledHeaderTitle>
                <FormattedMessage {...messages.projectsYouCanAdd} />
              </StyledHeaderTitle>
            </ListHeader>

            <ItemsNotInFolder projectFolderId={projectFolderId} />
          </>
        )}
      </ListsContainer>
    </Container>
  );
};

export default withRouter(AdminFolderProjectsList);
