import React from 'react';
import styled from 'styled-components';
import { media, defaultCardStyle } from 'utils/styleUtils';
import { colors } from 'utils/styleUtils';
import { Box, Button, Icon } from '@citizenlab/cl2-component-library';
import {
  StatusWrapper,
  StatusExplanation,
} from './ReactionControl/SharedStyles';
import useAcceptInitiativeCosponsorshipInvite from 'api/cosponsors_initiatives/useAcceptInitiativeCosponsorshipInvite';
import useInitiativeCosponsorsRequired from 'hooks/useInitiativeCosponsorsRequired';

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
  const { mutate: acceptInitiativeConsponsorshipInvite } =
    useAcceptInitiativeCosponsorshipInvite();

  if (!cosponsorsRequired) return null;

  const handleOnClickCosponsor = () => {
    acceptInitiativeConsponsorshipInvite(initiativeId);
  };

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
        <Button icon="volunteer" onClick={handleOnClickCosponsor}>
          Cosponsor
        </Button>
      </Container2>
    </Container>
  );
};

export default RequestToCosponsor;
