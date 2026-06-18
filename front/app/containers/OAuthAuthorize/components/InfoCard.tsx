import React from 'react';

import { Box, Text, colors } from '@citizenlab/cl2-component-library';

const InfoCard = ({
  icon,
  title,
  detail,
}: {
  icon: React.ReactNode;
  title: React.ReactNode;
  detail: React.ReactNode;
}) => (
  <Box
    display="flex"
    gap="12px"
    alignItems="flex-start"
    p="16px"
    border={`1px solid ${colors.borderLight}`}
    borderRadius="8px"
  >
    {icon}
    <Box>
      <Text m="0px" fontWeight="bold" color="tenantText">
        {title}
      </Text>
      <Text m="0px" variant="bodyS" color="textSecondary">
        {detail}
      </Text>
    </Box>
  </Box>
);

export default InfoCard;
