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
  /** Marks something that is set up, like a form that has questions. */
  active?: boolean;
}

const SummaryPill = ({ label, icon, active = false }: Props) => {
  const textColor = active ? 'teal700' : 'coolGrey700';

  return (
    <Box
      display="flex"
      alignItems="center"
      gap="6px"
      height="22px"
      px="10px"
      background={active ? colors.teal50 : colors.grey200}
      // A pill, so the radius is a shape rather than the card radius.
      borderRadius="999px"
    >
      {icon && (
        <Icon name={icon} width="14px" height="14px" fill={colors[textColor]} />
      )}
      <Text
        as="span"
        variant="boSection"
        m="0"
        fontSize="xs"
        color={textColor}
        whiteSpace="nowrap"
      >
        {label}
      </Text>
    </Box>
  );
};

export default SummaryPill;
