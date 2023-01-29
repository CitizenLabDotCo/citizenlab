import React from 'react';
import styled from 'styled-components';

// Components
import { Box, Icon, IconNames, Text } from '@citizenlab/cl2-component-library';

import { colors } from 'utils/styleUtils';

interface Props {
  label: string;
  icon: IconNames;
  onClick: () => void;
  'data-cy'?: string;
}

const AddIcon = styled(Icon).attrs({ name: 'plus' })`
  margin-left: auto;
  margin-right: 12px;
  fill: ${colors.textSecondary};
  margin-right: 0;
`;

const StyledBox = styled(Box)`
  text-align: left;
  ${AddIcon} {
    visibility: hidden;
  }
  &:hover {
    background-color: ${colors.grey200};
    transition: background-color 80ms ease-out 0s;
    cursor: pointer;
  }
  &:hover ${AddIcon} {
    visibility: visible;
  }
`;

const ToolboxItem = ({ icon, label, onClick, ...rest }: Props) => {
  return (
    <StyledBox
      display="flex"
      px="18px"
      py="18px"
      onClick={onClick}
      width="100%"
      m="0px"
      alignItems="center"
      // remove the role attribute when we add drag and drop functionality
      role="button"
      data-cy={rest['data-cy']}
    >
      <Icon fill={colors.primary} width="20px" height="20px" name={icon} />
      <Text fontSize="s" ml="12px" mt="0" mb="0" color="textPrimary">
        {label}
      </Text>
      <AddIcon />
    </StyledBox>
  );
};

export default ToolboxItem;
