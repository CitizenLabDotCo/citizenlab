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
  <Box display="flex" alignItems="flex-start" gap="4px">
    <Box display="flex" flex="0 0 14px" pt="1px">
      <Icon
        name={icon}
        width="14px"
        height="14px"
        fill={colors.coolGrey600}
        title={label}
      />
    </Box>
    <Text as="span" variant="boMicro" lineHeight="16px" m="0">
      {text}
    </Text>
  </Box>
);

export default NotificationDetail;
