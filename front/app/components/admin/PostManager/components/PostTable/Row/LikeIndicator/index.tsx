import React from 'react';

import { Box, IconNames } from '@citizenlab/cl2-component-library';

import LikeIcon from './LikeIcon';

interface Props {
  likeCount: number;
  iconName: IconNames;
}

const LikeIndicator = ({ iconName, likeCount }: Props) => {
  return (
    <Box display="flex" alignItems="center">
      <Box mr="4px">
        <LikeIcon iconName={iconName} />
      </Box>
      {likeCount}
    </Box>
  );
};

export default LikeIndicator;
