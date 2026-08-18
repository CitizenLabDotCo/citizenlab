import React from 'react';

import { IconNames } from '@citizenlab/cl2-component-library';

import RequirementToggle from '../RequirementToggle';

import RecencyControl from './RecencyControl';

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
  <RequirementToggle
    icon={icon}
    label={label}
    description={description}
    enabled={enabled}
    onChange={() => onChange({ enabled: !enabled, expiry })}
  >
    {enabled && (
      <RecencyControl
        expiry={expiry}
        verb={verb}
        onChange={(nextExpiry) => onChange({ enabled, expiry: nextExpiry })}
      />
    )}
  </RequirementToggle>
);

export default MethodRow;
