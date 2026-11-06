import React from 'react';

import { Box, IconNames, Text } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import messages from '../../messages';

import Chip from './Chip';
import { getChips } from './utils';

type Props = {
  icon: IconNames;
  changed: boolean;
  labels: string[];
  // The saved labels that a proposed update replaces.
  previousLabels?: string[];
};

// Shows what a proposed change adds to or removes from a list.
const ChangedChips = ({ icon, changed, labels, previousLabels }: Props) => {
  const { formatMessage } = useIntl();
  const chips = getChips(
    labels,
    changed && previousLabels ? previousLabels : labels
  );

  if (chips.length === 0) {
    return (
      <Text m="0px" fontSize="s">
        {formatMessage(messages.none)}
      </Text>
    );
  }

  return (
    <Box display="flex" flexWrap="wrap" gap="6px">
      {chips.map(({ label, state }) => (
        <Chip key={label} icon={icon} label={label} state={state} />
      ))}
    </Box>
  );
};

export default ChangedChips;
