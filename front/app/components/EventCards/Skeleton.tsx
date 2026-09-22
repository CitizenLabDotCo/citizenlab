import React from 'react';

import { Box, Shimmer, colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { cardColumn } from '.';

const Card = styled.li`
  ${cardColumn}
  list-style: none;
  padding: 16px;
  border: solid 1px ${colors.grey300};
  border-radius: 6px;
`;

const CardSkeleton = () => (
  <Card>
    <Box display="flex" justifyContent="space-between" alignItems="center">
      <Shimmer width="60%" height="22px" borderRadius="16px" />
      <Shimmer width="75px" height="56px" borderRadius="6px" />
    </Box>
    <Box my="16px" pt="12px" pb="4px" px="16px" background={colors.grey100}>
      <Shimmer width="70%" height="14px" borderRadius="16px" mb="12px" />
      <Shimmer width="50%" height="14px" borderRadius="16px" mb="12px" />
    </Box>
  </Card>
);

interface Props {
  count: number;
}

const Skeleton = ({ count }: Props) => (
  <Box display="flex" flexWrap="wrap" gap="16px" as="ul" px="0px" aria-busy>
    {Array.from({ length: count }, (_, i) => (
      <CardSkeleton key={i} />
    ))}
  </Box>
);

export default Skeleton;
