import React from 'react';

import {
  Button,
  colors,
  defaultCardStyle,
  Title,
  Text,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useAcceptCosponsorshipInvitation from 'api/cosponsorship/useAcceptCosponsorshipInvitation';
import useCosponsorships from 'api/cosponsorship/useCosponsorships';
import useAuthUser from 'api/me/useAuthUser';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

export const BorderContainer = styled.div`
  padding: 28px;
  border: 1px solid ${colors.borderLight};
  ${defaultCardStyle};
`;

interface Props {
  ideaId: string;
}

const RequestToCosponsor = ({ ideaId }: Props) => {
  const { mutate: acceptConsponsorshipInvite, isLoading } =
    useAcceptCosponsorshipInvitation();

  const { data: cosponsors } = useCosponsorships({
    ideaId,
  });

  const { data: authUser } = useAuthUser();
  const { formatMessage } = useIntl();

  const invitedCosponsor = cosponsors?.data.find(
    (cosponsor) => cosponsor.relationships.user.data.id === authUser?.data.id
  );
  const isInvitationPending = invitedCosponsor?.attributes.status === 'pending';

  if (invitedCosponsor) {
    return (
      <BorderContainer>
        <Title variant="h3" mt="0px">
          {formatMessage(messages.cosponsorInvitation)}
        </Title>
        <Text>{formatMessage(messages.cosponsorInvitationDescription)}</Text>

        <Button
          icon="volunteer"
          onClick={() =>
            acceptConsponsorshipInvite({
              ideaId,
              id: invitedCosponsor.id,
            })
          }
          processing={isLoading}
          disabled={!isInvitationPending}
          bgColor={isInvitationPending ? colors.primary : colors.success}
        >
          {isInvitationPending
            ? formatMessage(messages.cosponsorAcceptInvitation)
            : formatMessage(messages.cosponsorInvitationAccepted)}
        </Button>
      </BorderContainer>
    );
  }

  return null;
};

export default RequestToCosponsor;
