import React from 'react';

import {
  Box,
  Icon,
  IconNames,
  bo,
  colors,
} from '@citizenlab/cl2-component-library';

type Props = {
  name: IconNames;
  highlighted: boolean;
};

const ItemIcon = ({ name, highlighted }: Props) => (
  <Box
    width="36px"
    height="36px"
    flexShrink={0}
    display="flex"
    alignItems="center"
    justifyContent="center"
    borderRadius={bo.borderRadius}
    bgColor={highlighted ? colors.teal50 : colors.grey100}
  >
    <Icon
      name={name}
      width="18px"
      height="18px"
      fill={highlighted ? colors.teal500 : colors.coolGrey600}
    />
  </Box>
);

export default ItemIcon;
