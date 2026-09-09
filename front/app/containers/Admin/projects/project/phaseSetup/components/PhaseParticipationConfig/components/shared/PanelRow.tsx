import React from 'react';

import { Box, Icon, Text, colors } from '@citizenlab/cl2-component-library';

interface Props {
  label: string;
  /** The current value, shown on the row so it reads without opening it. */
  summary?: string;
  onClick: () => void;
}

/**
 * A settings panel row that opens its own surface rather than expanding.
 * Matches PanelGroup's row so a list of the two reads as one set of choices.
 */
const PanelRow = ({ label, summary, onClick }: Props) => (
  <Box borderTop={`1px solid ${colors.grey200}`}>
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
      onClick={onClick}
    >
      <Text fontSize="s" fontWeight="semi-bold" color="textPrimary" m="0">
        {label}
      </Text>
      <Box display="flex" alignItems="center" gap="8px">
        {summary && (
          <Text fontSize="s" color="textSecondary" m="0">
            {summary}
          </Text>
        )}
        <Icon
          name="chevron-right"
          width="16px"
          height="16px"
          fill={colors.coolGrey500}
        />
      </Box>
    </Box>
  </Box>
);

export default PanelRow;
