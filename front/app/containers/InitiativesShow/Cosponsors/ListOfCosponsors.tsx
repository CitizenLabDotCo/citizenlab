import React from 'react';
import { Box, Text } from '@citizenlab/cl2-component-library';
import Avatar from 'components/Avatar';
import { IInitiativeCosponsorship } from 'api/initiatives/types';

interface Props {
  cosponsorships: IInitiativeCosponsorship[];
}

const ListOfCosponsors = ({ cosponsorships }: Props) => {
  return (
    <>
      {cosponsorships.map((cosponsorship, index) => {
        return (
          <Box key={index} display="flex" alignItems="center">
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
