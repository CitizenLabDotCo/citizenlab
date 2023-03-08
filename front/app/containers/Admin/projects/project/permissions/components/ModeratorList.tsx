import React, { memo, FormEvent } from 'react';
import { isError } from 'lodash-es';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import messages from './messages';
import Button from 'components/UI/Button';
import { List, Row } from 'components/admin/ResourceList';
import Avatar from 'components/Avatar';
import { isNilOrError } from 'utils/helperUtils';
import { deleteProjectModerator } from 'services/projectModerators';
import { WrappedComponentProps } from 'react-intl';
import styled from 'styled-components';
import { Text, Box } from '@citizenlab/cl2-component-library';
import { queryClient } from 'utils/cl-react-query/queryClient';
import seatsKeys from 'api/seats/keys';

// hooks
import useProjectModerators from 'hooks/useProjectModerators';
import useAuthUser from 'hooks/useAuthUser';

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

const ModeratorList = memo(
  ({ projectId, intl: { formatMessage } }: Props & WrappedComponentProps) => {
    const moderators = useProjectModerators(projectId);
    const authUser = useAuthUser();

    const handleDeleteClick =
      (projectId: string, moderatorId: string) => async (event: FormEvent) => {
        event.preventDefault();
        const deleteMessage = formatMessage(
          messages.moderatorDeletionConfirmation
        );

        if (window.confirm(deleteMessage)) {
          await deleteProjectModerator(projectId, moderatorId);
          queryClient.invalidateQueries({ queryKey: seatsKeys.items() });
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
                <Row
                  key={moderator.id}
                  isLastItem={index === moderators.length - 1}
                >
                  <Box display="flex" alignItems="center">
                    <Box mr="8px">
                      <Avatar userId={moderator.id} size={30} />
                    </Box>
                    <Text as="span" m={'0'}>
                      {displayName}
                    </Text>
                  </Box>
                  <Text as="span" m={'0'}>
                    {moderator.attributes.email}
                  </Text>
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
          </>
        </Container>
      );
    }

    return null;
  }
);

export default injectIntl(ModeratorList);
