// The shared shape of a requirement row: a toggle labelled with an icon, a
// title and a description, optionally followed by extra controls that only
// apply while the requirement is on.

import React, { ReactNode } from 'react';

import {
  Box,
  Text,
  Icon,
  IconNames,
  IconTooltip,
  Toggle,
  colors,
} from '@citizenlab/cl2-component-library';

interface Props {
  icon: IconNames;
  label: string;
  description: string;
  tooltip?: string;
  // Shown next to the label, e.g. to explain why the toggle is disabled.
  statusLabel?: string;
  enabled: boolean;
  disabled?: boolean;
  dataCy?: string;
  children?: ReactNode;
  onChange: () => void;
}

const RequirementToggle = ({
  icon,
  label,
  description,
  tooltip,
  statusLabel,
  enabled,
  disabled,
  onChange,
}: Props) => (
  <Toggle
    checked={enabled}
    disabled={disabled}
    onChange={onChange}
    size="small"
    label={
      <Box
        ml="8px"
        opacity={disabled ? 0.5 : undefined}
        style={disabled ? { cursor: 'not-allowed' } : undefined}
      >
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
          {tooltip && <IconTooltip content={tooltip} iconSize="14px" />}
          {statusLabel && (
            <Text as="span" m="0" fontSize="xs" color="coolGrey600">
              ({statusLabel})
            </Text>
          )}
        </Box>
        <Text as="span" m="0" fontSize="xs" color="coolGrey600">
          {description}
        </Text>
      </Box>
    }
  />
);

export default RequirementToggle;
