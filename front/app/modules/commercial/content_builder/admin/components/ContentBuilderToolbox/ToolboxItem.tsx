import React from 'react';

// Components
import { Box, Icon, IconNames } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';
import { fontSizes, colors } from 'utils/styleUtils';

const ToolboxItemText = styled.p`
  color: ${colors.adminTextColor};
  font-size: ${fontSizes.base}px;
`;

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
      <ToolboxItemText>{label}</ToolboxItemText>
    </Box>
  );
};

export default ToolboxItem;
