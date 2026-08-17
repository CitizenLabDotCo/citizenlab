import React from 'react';

import {
  Box,
  Text,
  Icon,
  IconNames,
  Toggle,
  colors,
} from '@citizenlab/cl2-component-library';

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
  <Box py="10px">
    <Toggle
      checked={enabled}
      onChange={() => onChange({ enabled: !enabled, expiry })}
      size="small"
      label={
        <Box ml="8px">
          <Box display="flex" alignItems="center" gap="6px">
            <Icon
              name={icon}
              width="16px"
              height="16px"
              fill={enabled ? colors.teal500 : colors.coolGrey500}
            />
            <Text as="span" m="0" fontSize="s" fontWeight="semi-bold">
              {label}
            </Text>
          </Box>
          <Text as="span" m="0" fontSize="xs" color="coolGrey600">
            {description}
          </Text>
        </Box>
      }
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
