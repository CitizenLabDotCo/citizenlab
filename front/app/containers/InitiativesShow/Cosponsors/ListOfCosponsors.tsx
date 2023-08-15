import React from 'react';
import useInitiativeById from 'api/initiatives/useInitiativeById';
import { Box, Text } from '@citizenlab/cl2-component-library';
import Avatar from 'components/Avatar';

interface Props {
  initiativeId: string;
}

const ListOfCosponsors = ({ initiativeId }: Props) => {
  const { data: initiative } = useInitiativeById(initiativeId);
  const cosponsorships = initiative?.data.attributes.cosponsorships;
  // const acceptedCosponsorships = initiative.data.attributes.cosponsorships?.filter(co => co.status === 'accepted');

  if (!cosponsorships) return null;

  return (
    <>
      {cosponsorships.map((cosponsorship) => {
        return (
          <Box display="flex" alignItems="center">
            <Box mr="4px">
              <Avatar userId={cosponsorship.user_id} size={32} />
            </Box>
            <Text fontSize="base">{cosponsorship.name}</Text>
          </Box>
        );
      })}
    </>
  );
};

export default ListOfCosponsors;
