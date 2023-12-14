import React from 'react';
import { Icon, colors } from '@citizenlab/cl2-component-library';

const Dot = () => (
  <Icon
    name="dot"
    width="6px"
    height="6px"
    display="inline"
    fill={colors.textSecondary}
    ml="8px"
    mr="8px"
    transform="translate(0,-1)"
  />
);

export default Dot;
