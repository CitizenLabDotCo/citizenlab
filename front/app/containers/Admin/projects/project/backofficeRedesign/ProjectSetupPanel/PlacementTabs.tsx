import React from 'react';

import { Box, Text, colors } from '@citizenlab/cl2-component-library';

import { PhasePlacementType } from 'api/phases/types';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

interface Props {
  selected: PhasePlacementType;
  onSelect: (placement: PhasePlacementType) => void;
}

const PLACEMENTS = [
  { key: 'on_timeline', label: messages.placementTimeline },
  { key: 'standalone', label: messages.placementStandalone },
] as const;

const PlacementTabs = ({ selected, onSelect }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Box
      display="flex"
      gap="32px"
      px="24px"
      borderBottom={`1px solid ${colors.grey200}`}
      role="tablist"
    >
      {PLACEMENTS.map(({ key, label }) => {
        const active = key === selected;

        return (
          <Box
            key={key}
            as="button"
            type="button"
            role="tab"
            aria-selected={active}
            background="transparent"
            border="none"
            borderBottom={`2px solid ${
              active ? colors.primary : 'transparent'
            }`}
            px="0"
            py="12px"
            style={{ cursor: 'pointer' }}
            onClick={() => onSelect(key)}
          >
            <Text
              variant={active ? 'bo-section' : 'bo-label'}
              color={active ? 'primary' : undefined}
            >
              {formatMessage(label)}
            </Text>
          </Box>
        );
      })}
    </Box>
  );
};

export default PlacementTabs;
