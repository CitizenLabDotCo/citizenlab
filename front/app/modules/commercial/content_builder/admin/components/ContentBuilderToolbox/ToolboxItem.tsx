import React from 'react';

// Components
import { Box, Icon, IconNames, Text } from '@citizenlab/cl2-component-library';
import { colors } from 'utils/styleUtils';

interface Props {
  label: string;
  icon: IconNames;
}

const ToolboxItem = ({ icon, label }: Props) => {
  return (
    <Box marginBottom="16px" width="100%" display="flex" paddingLeft="10px">
      <Icon
        marginRight="16px"
        width="20px"
        height="20px"
        fill={colors.adminTextColor}
        name={icon}
      />
      <Text color="adminTextColor">{label}</Text>
    </Box>
  );
};

export default ToolboxItem;
