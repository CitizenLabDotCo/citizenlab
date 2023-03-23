import React from 'react';
import { Text, Box } from '@citizenlab/cl2-component-library';
import Avatar from 'components/Avatar';
import Button from 'components/UI/Button';
import { Row } from 'components/admin/ResourceList';
import { useIntl } from 'utils/cl-intl';
import messages from './messages';
import { isAdmin } from 'services/permissions/roles';
import { IUserData } from 'services/users';
import styled from 'styled-components';
import { deleteProjectModerator } from 'services/projectModerators';
import useAuthUser from 'hooks/useAuthUser';
import { isNilOrError } from 'utils/helperUtils';

interface Props {
  isLastItem: boolean;
  moderator: IUserData;
  projectId: string;
}

const PendingInvitation = styled.span`
  font-style: italic;
`;

const ModeratorListRow = ({ isLastItem, moderator, projectId }: Props) => {
  const { formatMessage } = useIntl();
  const authUser = useAuthUser();

  if (isNilOrError(authUser)) {
    return null;
  }

  const moderatorId = moderator.id;
  const firstName = moderator.attributes.first_name;
  const lastName = moderator.attributes.last_name;
  const name = lastName ? `${firstName} ${lastName}` : firstName;
  const invitationPending = moderator.attributes.invite_status === 'pending';
  const displayName = invitationPending ? (
    <PendingInvitation>
      {formatMessage(messages.pendingInvitation)}
    </PendingInvitation>
  ) : (
    name
  );
  const handleDeleteClick = () => {
    if (window.confirm(formatMessage(messages.moderatorDeletionConfirmation))) {
      deleteProjectModerator(projectId, moderatorId);
    }
  };

  return (
    <Row isLastItem={isLastItem}>
      <Box display="flex" alignItems="center">
        <Box mr="12px">
          <Avatar userId={moderatorId} size={30} />
        </Box>
        <Text as="span" m={'0'}>
          {displayName}
        </Text>
      </Box>
      <Text as="span" m="0">
        {moderator.attributes.email}
      </Text>
      <Button
        onClick={handleDeleteClick}
        buttonStyle="text"
        icon="delete"
        // Component is on a page that is accessible
        // for both project moderators and admins
        disabled={!isAdmin({ data: authUser })}
      >
        {formatMessage(messages.deleteModeratorLabel)}
      </Button>
    </Row>
  );
};

export default ModeratorListRow;
