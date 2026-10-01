import React from 'react';

import {
  Box,
  colors,
  IconButton,
  stylingConsts,
  Text,
} from '@citizenlab/cl2-component-library';

interface Props {
  label: string;
  onRemove?: () => void;
  removeLabel?: string;
}

const TagChip = ({ label, onRemove, removeLabel }: Props) => (
  <Box
    display="flex"
    alignItems="center"
    gap="2px"
    px="6px"
    py="2px"
    background={colors.grey100}
    borderRadius={stylingConsts.borderRadius}
  >
    <Text
      as="span"
      m="0"
      fontSize="xs"
      fontWeight="semi-bold"
      whiteSpace="nowrap"
    >
      {label}
    </Text>
    {onRemove && removeLabel && (
      <IconButton
        iconName="close"
        iconWidth="12px"
        iconHeight="12px"
        iconColor={colors.coolGrey600}
        iconColorOnHover={colors.textPrimary}
        a11y_buttonActionMessage={removeLabel}
        onClick={onRemove}
      />
    )}
  </Box>
);

export default TagChip;
