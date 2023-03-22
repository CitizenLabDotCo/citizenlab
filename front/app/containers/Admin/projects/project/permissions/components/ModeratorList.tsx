import React, { memo } from 'react';
import { isError } from 'lodash-es';
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import messages from './messages';
import { List } from 'components/admin/ResourceList';
import { isNilOrError } from 'utils/helperUtils';
import { deleteProjectModerator } from 'services/projectModerators';
import styled from 'styled-components';
import ModeratorListRow from './ModeratorListRow';
import useProjectModerators from 'hooks/useProjectModerators';
import useAuthUser from 'hooks/useAuthUser';
import { isAdmin } from 'services/permissions/roles';

const PendingInvitation = styled.span`
  font-style: italic;
`;

const UnknownName = styled.span`
  font-style: italic;
`;

const Container = styled(List)`
  margin-bottom: 20px;
`;

interface Props {
  projectId: string;
}

const ModeratorList = memo(({ projectId }: Props) => {
  const { formatMessage } = useIntl();
  const moderators = useProjectModerators(projectId);
  const authUser = useAuthUser();

  const handleDeleteClick = (moderatorId: string) => () => {
    if (window.confirm(formatMessage(messages.moderatorDeletionConfirmation))) {
      deleteProjectModerator(projectId, moderatorId);
    }
  };

  if (isError(moderators)) {
    return <FormattedMessage {...messages.moderatorsNotFound} />;
  }

  if (!isNilOrError(authUser) && !isNilOrError(moderators)) {
    return (
      <Container>
        <>
          {moderators.map((moderator, index) => {
            const firstName = moderator.attributes.first_name;
            const lastName = moderator.attributes.last_name;
            const invitationPending =
              moderator.attributes.invite_status === 'pending';
            const displayName = invitationPending ? (
              <PendingInvitation>
                {formatMessage(messages.pendingInvitation)}
              </PendingInvitation>
            ) : firstName && lastName ? (
              `${firstName} ${lastName}`
            ) : (
              <UnknownName>{formatMessage(messages.unknownName)}</UnknownName>
            );

            return (
              <ModeratorListRow
                isLastItem={index === moderators.length - 1}
                onDelete={handleDeleteClick(moderator.id)}
                displayName={displayName}
                deleteButtonDisabled={isAdmin({ data: moderator })}
                moderatorId={moderator.id}
              />
            );
          })}
        </>
      </Container>
    );
  }

  return null;
});

export default ModeratorList;
