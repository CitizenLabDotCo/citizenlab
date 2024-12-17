import React from 'react';

import { colors, Icon, IconNames } from '@citizenlab/cl2-component-library';
interface Props {
  iconName: IconNames;
}

const LikeIcon = ({ iconName }: Props) => {
  return <Icon width="16px" fill={colors.blue500} name={iconName} />;
};

export default LikeIcon;
