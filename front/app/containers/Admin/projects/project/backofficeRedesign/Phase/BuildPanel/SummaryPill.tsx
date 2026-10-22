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
  icon?: IconNames;
}

const SummaryPill = ({ label, icon }: Props) => (
  <Box
    display="flex"
    alignItems="center"
    gap="6px"
    height="22px"
    px="10px"
    background={colors.grey200}
    // A pill, so the radius is a shape rather than the card radius.
    borderRadius="999px"
  >
    {icon && (
      <Icon name={icon} width="14px" height="14px" fill={colors.coolGrey700} />
    )}
    <Text
      as="span"
      m="0"
      fontSize="xs"
      fontWeight="semi-bold"
      color="coolGrey700"
      whiteSpace="nowrap"
    >
      {label}
    </Text>
  </Box>
);

export default SummaryPill;
