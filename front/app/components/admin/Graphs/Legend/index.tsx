import React from 'react';

import { Box, Icon, Text } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

const StyledIcon = styled(Icon)`
  transform: translateY(-1px);
`;
interface Props {
  labels: string[];
  colors: string[];
  'data-testid'?: string;
}

const Legend = ({ labels, colors }: Props) => (
  <Box data-testid="graph-legend">
    {labels.map((label, i) => {
      const color = colors[i % colors.length];
      const lastItem = labels.length - 1 === i;

      return (
        <Box key={i} display="inline-block">
          <Box
            display="flex"
            flexDirection="row"
            alignItems="center"
            justifyContent="center"
            mr={lastItem ? undefined : '12px'}
          >
            <StyledIcon
              name="dot"
              width="10px"
              height="10px"
              fill={color}
              mr="8px"
            />
            <Text fontSize="s" color="textSecondary" m="0">
              {label}
            </Text>
          </Box>
        </Box>
      );
    })}
  </Box>
);

export default Legend;
