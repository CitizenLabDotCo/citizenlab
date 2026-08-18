// A single PII toggle (full name / password) with an icon and description.

import React from 'react';

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
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  tooltip?: string;
  onChange: () => void;
}

const PiiToggle = ({
  icon,
  title,
  description,
  checked,
  disabled,
  tooltip,
  onChange,
}: Props) => (
  <Box py="8px">
    <Toggle
      checked={checked}
      disabled={disabled}
      onChange={onChange}
      size="small"
      label={
        <Box ml="8px">
          <Box display="flex" alignItems="center" gap="6px">
            <Icon
              name={icon}
              width="16px"
              height="16px"
              fill={checked ? colors.teal500 : colors.coolGrey500}
            />
            <Text
              as="span"
              m="0"
              fontSize="s"
              fontWeight="semi-bold"
              color="primary"
            >
              {title}
            </Text>
            {tooltip && <IconTooltip content={tooltip} iconSize="14px" />}
          </Box>
          <Text as="span" m="0" fontSize="xs" color="coolGrey600">
            {description}
          </Text>
        </Box>
      }
    />
  </Box>
);

export default PiiToggle;
