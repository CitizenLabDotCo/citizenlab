import React from 'react';
import styled from 'styled-components';

// Components
import { Box, Icon, IconNames, Text } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';

import { colors } from 'utils/styleUtils';

interface Props {
  label: string;
  icon: IconNames;
  onClick: () => void;
}

const StyledBox = styled(Box)`
  &:hover {
    background-color: ${colors.emailBg};
    transition: background-color 80ms ease-out 0s;
  }
`;

const ToolboxItem = ({ icon, label, onClick }: Props) => {
  return (
    <StyledBox
      width="100%"
      display="flex"
      paddingLeft="12px"
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
      <Button buttonStyle="text" onClick={onClick} icon="plus" />
    </StyledBox>
  );
};

export default ToolboxItem;
