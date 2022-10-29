import React from 'react';
import styled from 'styled-components';

// components
import { Box, Icon, Text } from '@citizenlab/cl2-component-library';

const StyledIcon = styled(Icon)`
  transform: translateY(-1px);
`;
interface Props {
  labels: string[];
  colors: string[];
  'data-testid'?: string;
}

const Legend = ({ labels, colors }: Props) => (
  <Box display="flex" flexDirection="row" data-testid="graph-legend">
    {labels.map((label, i) => {
      const color = colors[i];
      const lastItem = labels.length - 1 === i;

      return (
        <Box
          display="flex"
          flexDirection="row"
          alignItems="center"
          mr={lastItem ? undefined : '12px'}
          key={i}
        >
          <StyledIcon
            name="dot"
            width="10px"
            height="10px"
            fill={color}
            mr="8px"
          />
          <Text fontSize="s" color="textSecondary">
            {label}
          </Text>
        </Box>
      );
    })}
  </Box>
);

export default Legend;
