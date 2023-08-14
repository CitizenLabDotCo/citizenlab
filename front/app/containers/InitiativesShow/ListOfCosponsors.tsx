import React from 'react';
import useInitiativeById from 'api/initiatives/useInitiativeById';
import {
  Box,
  Text,
  Title,
  colors,
  defaultStyles,
} from '@citizenlab/cl2-component-library';
import Avatar from 'components/Avatar';
import { useTheme } from 'styled-components';

interface Props {
  initiativeId: string;
}

const ListOfCosponsors = ({ initiativeId }: Props) => {
  const { data: initiative } = useInitiativeById(initiativeId);
  const theme = useTheme();

  if (!initiative) return null;

  // const acceptedCosponsorships = initiative.data.attributes.cosponsorships?.filter(co => co.status === 'accepted');
  const cosponsorships = initiative.data.attributes.cosponsorships;

  return (
    <Box
      padding="36px"
      border={`1px solid ${colors.grey300}`}
      borderRadius={theme.borderRadius}
      boxShadow={defaultStyles.boxShadow}
    >
      <Title variant="h5" as="h2">
        Cosponsors of this proposal
      </Title>
      {cosponsorships?.map((cosponsorship) => {
        return (
          <Box display="flex" alignItems="center">
            <Box mr="4px">
              <Avatar userId={cosponsorship.user_id} size={32} />
            </Box>
            <Text fontSize="base">{cosponsorship.name}</Text>
          </Box>
        );
      })}
    </Box>
  );
};

export default ListOfCosponsors;
