import React from 'react';
import styled from 'styled-components';
import { media, defaultCardStyle } from 'utils/styleUtils';
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

const Container = styled.div``;

const StatusIcon = styled(Icon)`
  path {
    fill: ${colors.coolGrey600};
  }
  width: 30px;
  height: 30px;
  margin-bottom: 20px;
`;

const Container2 = styled.div`
  ${media.desktop`
    margin-bottom: 45px;
    padding: 35px;
    border: 1px solid #e0e0e0;
    ${defaultCardStyle};
  `}

  ${media.tablet`
    padding: 15px;
  `}
`;

interface Props {
  initiativeId: string;
  className?: string;
  id?: string;
}

const RequestToCosponsor = ({ className, id, initiativeId }: Props) => {
  const cosponsorsRequired = useInitiativeCosponsorsRequired();
  const {
    mutate: acceptInitiativeConsponsorshipInvite,
    isLoading,
    isSuccess,
  } = useAcceptInitiativeCosponsorshipInvite();
  const { data: initiative } = useInitiativeById(initiativeId);
  const { data: authUser } = useAuthUser();

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
      <Container id={id} className={className || ''} aria-live="polite">
        <Container2>
          <Box mb="16px">
            <StatusWrapper>Cosponsor</StatusWrapper>
          </Box>
          <StatusIcon ariaHidden name="user" />
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
              You've succesfully cosponsored this proposal!
            </Text>
          )}
        </Container2>
      </Container>
    );
  }

  return null;
};

export default RequestToCosponsor;
