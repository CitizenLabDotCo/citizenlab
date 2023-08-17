import React from 'react';
import {
  Box,
  Button,
  Icon,
  Text,
  colors,
} from '@citizenlab/cl2-component-library';
import {
  StatusWrapper,
  StatusExplanation,
} from './ReactionControl/SharedStyles';
import useAcceptInitiativeCosponsorshipInvite from 'api/cosponsors_initiatives/useAcceptInitiativeCosponsorshipInvite';
import useInitiativeCosponsorsRequired from 'hooks/useInitiativeCosponsorsRequired';
import useInitiativeById from 'api/initiatives/useInitiativeById';
import useAuthUser from 'api/me/useAuthUser';
import BorderContainer from './BorderContainer';
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

interface Props {
  initiativeId: string;
}

const RequestToCosponsor = ({ initiativeId }: Props) => {
  const cosponsorsRequired = useInitiativeCosponsorsRequired();
  const {
    mutate: acceptInitiativeConsponsorshipInvite,
    isLoading,
    isSuccess,
  } = useAcceptInitiativeCosponsorshipInvite();
  const { data: initiative } = useInitiativeById(initiativeId);
  const { data: authUser } = useAuthUser();
  const { formatMessage } = useIntl();

  if (!cosponsorsRequired || !initiative || !authUser) return null;

  const handleOnClickCosponsor = () => {
    acceptInitiativeConsponsorshipInvite(initiativeId);
  };

  const authUserId = authUser.data.id;
  const cosponsorships = initiative.data.attributes.cosponsorships;
  const authUserHasCosponsored = cosponsorships
    .filter((c) => c.status === 'accepted')
    .map((cosponsorship) => cosponsorship.user_id)
    .includes(authUserId);
  const authUserIsInvitedToCosponsor = cosponsorships
    .filter((c) => c.status === 'pending')
    .map((c) => c.user_id)
    .includes(authUserId);
  const authUserIsAuthor =
    initiative.data.relationships.author.data?.id === authUserId;

  if (
    !authUserIsAuthor &&
    (authUserIsInvitedToCosponsor || authUserHasCosponsored)
  ) {
    return (
      <BorderContainer>
        <Box mb="16px">
          <StatusWrapper>Cosponsor</StatusWrapper>
        </Box>
        <Box mb="20px">
          <Icon
            ariaHidden
            name="user"
            fill={colors.coolGrey600}
            width="30px"
            height="30px"
          />
        </Box>
        <Box mb="24px">
          <StatusExplanation>
            <b>Filler.</b> Filler.
            <Box mt="20px">Filler.</Box>
          </StatusExplanation>
        </Box>
        <Button
          icon="volunteer"
          onClick={handleOnClickCosponsor}
          processing={isLoading}
          disabled={authUserHasCosponsored}
        >
          Cosponsor
        </Button>
        {isSuccess && (
          <Text color="success">
            {formatMessage(messages.cosponsorshipSuccess)}
          </Text>
        )}
      </BorderContainer>
    );
  }

  return null;
};

export default RequestToCosponsor;
