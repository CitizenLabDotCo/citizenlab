import React from 'react';
import { Title } from '@citizenlab/cl2-component-library';
import ListOfCosponsors from './ListOfCosponsors';
import useInitiativeById from 'api/initiatives/useInitiativeById';
import BorderContainer from '../BorderContainer';

interface Props {
  initiativeId: string;
}

const Cosponsors = ({ initiativeId }: Props) => {
  const { data: initiative } = useInitiativeById(initiativeId);
  const acceptedCosponsorships =
    initiative?.data.attributes.cosponsorships.filter(
      (c) => c.status === 'accepted'
    );

  if (!acceptedCosponsorships || acceptedCosponsorships.length === 0)
    return null;

  return (
    <BorderContainer>
      <Title variant="h5" as="h2">
        Cosponsors of this proposal
      </Title>
      <ListOfCosponsors cosponsorships={acceptedCosponsorships} />
    </BorderContainer>
  );
};

export default Cosponsors;
