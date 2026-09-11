import React from 'react';

import {
  Box,
  Icon,
  IconNames,
  Text,
  colors,
} from '@citizenlab/cl2-component-library';

interface Props {
  label: string;
  icon: IconNames;
  ariaExpanded?: boolean;
  onClick: () => void;
}

const PanelRowButton = ({ label, icon, ariaExpanded, onClick }: Props) => (
  <Box
    as="button"
    type="button"
    w="100%"
    display="flex"
    alignItems="center"
    justifyContent="space-between"
    gap="8px"
    py="14px"
    background="transparent"
    border="none"
    style={{ cursor: 'pointer' }}
    aria-expanded={ariaExpanded}
    onClick={onClick}
  >
    <Text fontSize="s" fontWeight="semi-bold" color="textPrimary" m="0">
      {label}
    </Text>
    <Icon name={icon} width="16px" height="16px" fill={colors.coolGrey500} />
  </Box>
);

export default PanelRowButton;
