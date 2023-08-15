import React from 'react';
import {
  Box,
  Title,
  colors,
  defaultStyles,
} from '@citizenlab/cl2-component-library';
import { useTheme } from 'styled-components';
import ListOfCosponsors from './ListOfCosponsors';

interface Props {
  initiativeId: string;
}

const Cosponsors = ({ initiativeId }: Props) => {
  const theme = useTheme();

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
      <ListOfCosponsors initiativeId={initiativeId} />
    </Box>
  );
};

export default Cosponsors;
