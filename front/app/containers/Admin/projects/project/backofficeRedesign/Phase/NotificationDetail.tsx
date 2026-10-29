import React from 'react';

import {
  Box,
  Icon,
  IconNames,
  Text,
  colors,
} from '@citizenlab/cl2-component-library';

interface Props {
  icon: IconNames;
  label: string;
  text: string;
}

const NotificationDetail = ({ icon, label, text }: Props) => (
  <Box display="flex" alignItems="center" gap="6px">
    <Icon
      name={icon}
      width="14px"
      height="14px"
      fill={colors.coolGrey600}
      title={label}
    />
    <Text as="span" variant="boHelper" m="0">
      {text}
    </Text>
  </Box>
);

export default NotificationDetail;
