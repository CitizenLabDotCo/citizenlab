import React from 'react';

import { Box, Text, Tooltip } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useAuthUser from 'api/me/useAuthUser';
import useDeleteProjectModerator from 'api/project_moderators/useDeleteProjectModerator';
import { IUserData } from 'api/users/types';

import { Row } from 'components/admin/ResourceList';
import Avatar from 'components/Avatar';
import ButtonWithLink from 'components/UI/ButtonWithLink';

import { useIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';
import { isAdmin } from 'utils/permissions/roles';
import { isProjectFolderModerator } from 'utils/permissions/rules/projectFolderPermissions';

import messages from './messages';

interface Props {
  isLastItem: boolean;
  moderator: IUserData;
  projectId: string;
  folderId: string | null;
}

const PendingInvitation = styled.span`
  font-style: italic;
`;

const ModeratorListRow = ({
  isLastItem,
  moderator,
  projectId,
  folderId,
}: Props) => {
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

  const moderatesFolder = folderId
    ? isProjectFolderModerator({ data: moderator }, folderId)
    : false;
  const deleteDisabled = !isAdmin(authUser) || moderatesFolder;
  const disabledTooltip = moderatesFolder
    ? formatMessage(messages.cannotDeleteFolderModerator)
    : null;

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
      {/*
        For some reason, the button moves slightly to the left when the tooltip
        is displayed if the Tooltip is not wrapped in a Box.
      */}
      <Box>
        <Tooltip
          content={disabledTooltip}
          disabled={!disabledTooltip}
          placement="left"
        >
          <Box>
            <ButtonWithLink
              onClick={handleDeleteClick}
              buttonStyle="text"
              icon="delete"
              disabled={deleteDisabled}
              processing={isLoading}
            >
              {formatMessage(messages.deleteModeratorLabel)}
            </ButtonWithLink>
          </Box>
        </Tooltip>
      </Box>
    </Row>
  );
};

export default ModeratorListRow;
