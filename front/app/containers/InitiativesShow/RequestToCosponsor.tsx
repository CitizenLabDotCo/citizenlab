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
import useInitiativeCosponsorsRequired from 'containers/InitiativesShow/hooks/useInitiativeCosponsorsRequired';
import useInitiativeById from 'api/initiatives/useInitiativeById';
import useAuthUser from 'api/me/useAuthUser';
import BorderContainer from './BorderContainer';
import { useIntl } from 'utils/cl-intl';
import messages from './messages';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

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
  const { data: appConfiguration } = useAppConfiguration();
  const { formatMessage } = useIntl();

  if (!cosponsorsRequired || !initiative || !authUser || !appConfiguration) {
    return null;
  }

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
  const authorName = initiative.data.attributes.author_name;
  const requiredNumberOfCosponsors =
    appConfiguration.data.attributes.settings.initiatives.cosponsors_number;

  if (
    !authUserIsAuthor &&
    (authUserIsInvitedToCosponsor || authUserHasCosponsored)
  ) {
    return (
      <BorderContainer>
        <Box mb="16px">
          <StatusWrapper>{formatMessage(messages.cosponsor)}</StatusWrapper>
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
            <b>
              {formatMessage(messages.youWereInvitedToConsponsorBy, {
                authorName,
              })}
            </b>
            {typeof requiredNumberOfCosponsors === 'number' && (
              <Box mt="20px">
                {formatMessage(messages.cosponsorRequirementInfo, {
                  requiredNumberOfCosponsors,
                })}
              </Box>
            )}
          </StatusExplanation>
        </Box>
        <Button
          icon="volunteer"
          onClick={handleOnClickCosponsor}
          processing={isLoading}
          disabled={authUserHasCosponsored}
        >
          {formatMessage(messages.cosponsorCTA)}
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
