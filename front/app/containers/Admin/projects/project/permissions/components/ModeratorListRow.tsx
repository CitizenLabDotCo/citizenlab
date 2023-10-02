import React from 'react';
import { Text, Box } from '@citizenlab/cl2-component-library';
import Avatar from 'components/Avatar';
import Button from 'components/UI/Button';
import { Row } from 'components/admin/ResourceList';
import { useIntl } from 'utils/cl-intl';
import messages from './messages';
import { isAdmin } from 'utils/permissions/roles';
import { IUserData } from 'api/users/types';
import styled from 'styled-components';
import useAuthUser from 'api/me/useAuthUser';
import { isNilOrError } from 'utils/helperUtils';
import useDeleteProjectModerator from 'api/project_moderators/useDeleteProjectModerator';

interface Props {
  isLastItem: boolean;
  moderator: IUserData;
  projectId: string;
}

const PendingInvitation = styled.span`
  font-style: italic;
`;

const ModeratorListRow = ({ isLastItem, moderator, projectId }: Props) => {
  const { mutate: deleteProjectModerator, isLoading } =
    useDeleteProjectModerator();
  const { formatMessage } = useIntl();
  const { data: authUser } = useAuthUser();

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
      deleteProjectModerator({ projectId, id: moderatorId });
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
        disabled={!isAdmin(authUser)}
        processing={isLoading}
      >
        {formatMessage(messages.deleteModeratorLabel)}
      </Button>
    </Row>
  );
};

export default ModeratorListRow;
