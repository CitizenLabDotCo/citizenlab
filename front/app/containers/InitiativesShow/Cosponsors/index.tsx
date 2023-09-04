import React from 'react';
import { Title } from '@citizenlab/cl2-component-library';
import ListOfCosponsors from './ListOfCosponsors';
import useInitiativeById from 'api/initiatives/useInitiativeById';
import BorderContainer from '../BorderContainer';
import { useIntl } from 'utils/cl-intl';
import messages from '../messages';

interface Props {
  initiativeId: string;
}

const Cosponsors = ({ initiativeId }: Props) => {
  const { data: initiative } = useInitiativeById(initiativeId);
  const { formatMessage } = useIntl();
  const acceptedCosponsorships =
    initiative?.data.attributes.cosponsorships.filter(
      (c) => c.status === 'accepted'
    );

  if (!acceptedCosponsorships || acceptedCosponsorships.length === 0) {
    return null;
  }

  return (
    <BorderContainer>
      <Title variant="h5" as="h2">
        {formatMessage(messages.titleCosponsorsTile)}
      </Title>
      <ListOfCosponsors cosponsorships={acceptedCosponsorships} />
    </BorderContainer>
  );
};

export default Cosponsors;
