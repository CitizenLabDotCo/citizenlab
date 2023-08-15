import React from 'react';
import {
  Box,
  Title,
  colors,
  defaultStyles,
} from '@citizenlab/cl2-component-library';
import { useTheme } from 'styled-components';
import ListOfCosponsors from './ListOfCosponsors';
import useInitiativeById from 'api/initiatives/useInitiativeById';

interface Props {
  initiativeId: string;
}

const Cosponsors = ({ initiativeId }: Props) => {
  const theme = useTheme();
  const { data: initiative } = useInitiativeById(initiativeId);
  const acceptedCosponsorships =
    initiative?.data.attributes.cosponsorships.filter(
      (c) => c.status === 'accepted'
    );

  if (!acceptedCosponsorships || acceptedCosponsorships.length === 0)
    return null;

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
      <ListOfCosponsors cosponsorships={acceptedCosponsorships} />
    </Box>
  );
};

export default Cosponsors;
