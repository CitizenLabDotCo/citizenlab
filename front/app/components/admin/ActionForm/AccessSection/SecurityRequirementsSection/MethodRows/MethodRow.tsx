import React from 'react';

import { Box, IconNames } from '@citizenlab/cl2-component-library';

import RecencyControl from './RecencyControl';
import RequirementToggle from './RequirementToggle';

interface Props {
  icon: IconNames;
  label: string;
  description: string;
  enabled: boolean;
  expiry: number | null;
  verb: 'Re-confirm' | 'Re-verify';
  onChange: (next: { enabled: boolean; expiry: number | null }) => void;
}

const MethodRow = ({
  icon,
  label,
  description,
  enabled,
  expiry,
  verb,
  onChange,
}: Props) => (
  <Box py="12px">
    <RequirementToggle
      icon={icon}
      label={label}
      description={description}
      enabled={enabled}
      onChange={() => onChange({ enabled: !enabled, expiry })}
    />
    {enabled && (
      <Box ml="42px" mt="6px">
        <RecencyControl
          expiry={expiry}
          verb={verb}
          onChange={(nextExpiry) => onChange({ enabled, expiry: nextExpiry })}
        />
      </Box>
    )}
  </Box>
);

export default MethodRow;
