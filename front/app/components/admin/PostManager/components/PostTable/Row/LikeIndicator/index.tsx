import React from 'react';

import {
  Box,
  IconNames,
  Icon,
  colors,
} from '@citizenlab/cl2-component-library';

interface Props {
  likeCount: number;
  iconName: IconNames;
}

const LikeIndicator = ({ iconName, likeCount }: Props) => {
  return (
    <Box display="flex" alignItems="center">
      <Box mr="4px">
        <Icon width="16px" fill={colors.blue500} name={iconName} />
      </Box>
      {likeCount}
    </Box>
  );
};

export default LikeIndicator;
