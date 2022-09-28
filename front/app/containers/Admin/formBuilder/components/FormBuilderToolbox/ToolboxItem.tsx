import React from 'react';
import styled from 'styled-components';

// Components
import { Box, Icon, IconNames, Text } from '@citizenlab/cl2-component-library';

import { colors } from 'utils/styleUtils';

interface Props {
  label: string;
  icon: IconNames;
  onClick: () => void;
}

const AddIcon = styled(Icon).attrs({ name: 'plus' })`
  width: 16px;
  height: 16px;
  margin-left: auto;
  margin-right: 12px;
  fill: ${colors.textSecondary};
`;

const StyledBox = styled(Box)`
  text-align: left;
  ${AddIcon} {
    visibility: hidden;
  }
  &:hover {
    background-color: ${colors.emailBg};
    transition: background-color 80ms ease-out 0s;
  }
  &:hover ${AddIcon} {
    visibility: visible;
  }
`;

const ToolboxItem = ({ icon, label, onClick }: Props) => {
  return (
    <StyledBox
      display="flex"
      padding="4px"
      onClick={onClick}
      width="100%"
      m="0px"
      alignItems="center"
      px="0px"
    >
      <Icon
        fill={colors.primary}
        width="20px"
        height="20px"
        marginLeft="12px"
        name={icon}
      />
      <Text fontSize="s" marginLeft="8px" color="textPrimary">
        {label}
      </Text>
      <AddIcon />
    </StyledBox>
  );
};

export default ToolboxItem;
