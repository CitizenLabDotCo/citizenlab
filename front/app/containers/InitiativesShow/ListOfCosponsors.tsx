import React from 'react';
import useInitiativeById from 'api/initiatives/useInitiativeById';

interface Props {
  initiativeId: string;
}

const ListOfCosponsors = ({ initiativeId }: Props) => {
  const { data: initiative } = useInitiativeById(initiativeId);

  if (!initiative) return null;

  // const acceptedCosponsorships = initiative.data.attributes.cosponsorships?.filter(co => co.status === 'accepted');
  const cosponsorships = initiative.data.attributes.cosponsorships;

  return <>{cosponsorships?.map((cosponsorship) => cosponsorship.name)}</>;
};

export default ListOfCosponsors;
