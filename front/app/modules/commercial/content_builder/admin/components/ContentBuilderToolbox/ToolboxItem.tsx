import React from 'react';
import styled from 'styled-components';

// Components
import { Box, Icon, IconNames, Text } from '@citizenlab/cl2-component-library';
import { colors } from 'utils/styleUtils';

interface Props {
  label: string;
  icon: IconNames;
}

const StyledBox = styled(Box)`
  &:hover {
    background-color: ${colors.emailBg};
  }
`;

const ToolboxItem = ({ icon, label }: Props) => {
  return (
    <StyledBox
      width="100%"
      display="flex"
      paddingLeft="10px"
      alignItems="center"
    >
      <Icon
        marginRight="16px"
        width="20px"
        height="20px"
        fill={colors.adminTextColor}
        name={icon}
      />
      <Text color="text">{label}</Text>
    </StyledBox>
  );
};

export default ToolboxItem;
