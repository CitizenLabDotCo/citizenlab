import React, { memo, FormEvent } from 'react';
import { isError } from 'lodash-es';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import messages from './messages';
import Button from 'components/UI/Button';
import { List, Row } from 'components/admin/ResourceList';
import Avatar from 'components/Avatar';
import { isNilOrError } from 'utils/helperUtils';
import { deleteProjectModerator } from 'modules/project_management/services/projectModerators';
import { InjectedIntlProps } from 'react-intl';
import styled from 'styled-components';

// hooks
import useProjectModerators from 'modules/project_management/hooks/useProjectModerators';
import useAuthUser from 'hooks/useAuthUser';

const PendingInvitation = styled.span`
  font-style: italic;
`;

const UnknownName = styled.span`
  font-style: italic;
`;

interface Props {
  projectId: string;
}

const ModeratorList = memo(
  ({ projectId, intl: { formatMessage } }: Props & InjectedIntlProps) => {
    const moderators = useProjectModerators(projectId);
    const authUser = useAuthUser();

    const handleDeleteClick = (projectId: string, moderatorId: string) => (
      event: FormEvent
    ) => {
      event.preventDefault();
      const deleteMessage = formatMessage(
        messages.moderatorDeletionConfirmation
      );

      if (window.confirm(deleteMessage)) {
        deleteProjectModerator(projectId, moderatorId);
      }
    };

    // TO TEST
    if (isError(moderators)) {
      return <FormattedMessage {...messages.moderatorsNotFound} />;
    }

    if (!isNilOrError(authUser) && !isNilOrError(moderators)) {
      return (
        <List>
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
              <Row
                key={moderator.id}
                isLastItem={index === moderators.length - 1}
              >
                <Avatar userId={moderator.id} size={30} />
                <p className="expand">{displayName}</p>
                <p className="expand">{moderator.attributes.email}</p>
                <Button
                  onClick={handleDeleteClick(projectId, moderator.id)}
                  buttonStyle="text"
                  icon="delete"
                  disabled={authUser.id === moderator.id}
                >
                  <FormattedMessage {...messages.deleteModeratorLabel} />
                </Button>
              </Row>
            );
          })}
        </List>
      );
    }

    return null;
  }
);

export default injectIntl(ModeratorList);
