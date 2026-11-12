import React from 'react';

import {
  bo,
  Box,
  colors,
  IconButton,
  Text,
} from '@citizenlab/cl2-component-library';

interface Props {
  label: string;
  onRemove?: () => void;
  removeLabel?: string;
  outlined?: boolean;
}

const TagChip = ({ label, onRemove, removeLabel, outlined = false }: Props) => (
  <Box
    display="flex"
    alignItems="center"
    gap="4px"
    minHeight={outlined ? '22px' : undefined}
    px={outlined ? '10px' : '6px'}
    py={outlined ? '0' : '2px'}
    background={outlined ? colors.white : colors.grey100}
    border={outlined ? `1px solid ${colors.coolGrey500}` : undefined}
    borderRadius={outlined ? '999px' : bo.borderRadius}
  >
    <Text
      as="span"
      m="0"
      fontSize="xs"
      fontWeight="semi-bold"
      color={outlined ? 'coolGrey600' : undefined}
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
