import React from 'react';

// Components
import {
  Box,
  colors,
  Icon,
  IconNames,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

const ToolboxItemText = styled.p`
  color: ${colors.adminDarkestBackground};
  font-size: 15px;
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
        width="18px"
        height="18px"
        fill={colors.clBlue}
        name={icon}
      />
      <ToolboxItemText>{label}</ToolboxItemText>
    </Box>
  );
};

export default ToolboxItem;
