import React from 'react';

import {
  Box,
  Icon,
  IconNames,
  Text,
  colors,
} from '@citizenlab/cl2-component-library';

export type ChipState = 'saved' | 'added' | 'removed';

const STATE_COLORS: Record<
  ChipState,
  { background: string; border: string; icon: string }
> = {
  saved: {
    background: colors.grey100,
    border: colors.grey200,
    icon: colors.coolGrey600,
  },
  added: {
    background: colors.teal50,
    border: colors.teal200,
    icon: colors.teal500,
  },
  removed: {
    background: colors.red100,
    border: colors.red100,
    icon: colors.coolGrey600,
  },
};

type Props = {
  icon: IconNames;
  label: string;
  state: ChipState;
};

const Chip = ({ icon, label, state }: Props) => {
  const stateColors = STATE_COLORS[state];

  return (
    <Box
      display="inline-flex"
      alignItems="center"
      gap="6px"
      px="10px"
      py="4px"
      borderRadius="999px"
      bgColor={stateColors.background}
      border={`1px solid ${stateColors.border}`}
    >
      <Icon name={icon} width="14px" height="14px" fill={stateColors.icon} />
      <Text
        as="span"
        m="0px"
        fontSize="s"
        color={state === 'removed' ? 'textSecondary' : 'textPrimary'}
      >
        {state === 'removed' ? <del>{label}</del> : label}
      </Text>
    </Box>
  );
};

export default Chip;
