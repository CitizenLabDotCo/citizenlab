import React from 'react';
import RequestToCosponsor from './RequestToCosponsor';
import Cosponsors from './Cosponsors';
import useInitiativeById from 'api/initiatives/useInitiativeById';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import CosponsorShipReminder from './CosponsorShipReminder';
import useAuthUser from 'api/me/useAuthUser';
import { Box } from '@citizenlab/cl2-component-library';

interface Props {
  initiativeId: string;
}

const CosponsorsSection = ({ initiativeId }: Props) => {
  const { data: initiative } = useInitiativeById(initiativeId);
  const { data: appConfiguration } = useAppConfiguration();
  const { data: authUser } = useAuthUser();

  if (!initiative || !appConfiguration) return null;

  const authorId = initiative.data.relationships.author.data?.id;
  const signedInUserIsAuthor =
    typeof authorId === 'string' && typeof authUser?.data.id === 'string'
      ? authorId === authUser?.data.id
      : false;
  const requiredNumberOfCosponsors =
    appConfiguration.data.attributes.settings.initiatives?.cosponsors_number;
  const cosponsorships = initiative.data.attributes.cosponsorships;
  const acceptedCosponsorships = cosponsorships.filter(
    (c) => c.status === 'accepted'
  );
  const showCosponsorshipReminder =
    signedInUserIsAuthor && typeof requiredNumberOfCosponsors === 'number'
      ? requiredNumberOfCosponsors > acceptedCosponsorships.length
      : false;

  return (
    <>
      {showCosponsorshipReminder && (
        <Box mb="40px">
          <CosponsorShipReminder initiativeId={initiativeId} />
        </Box>
      )}
      <RequestToCosponsor initiativeId={initiativeId} />
      <Cosponsors initiativeId={initiativeId} />
    </>
  );
};

export default CosponsorsSection;
