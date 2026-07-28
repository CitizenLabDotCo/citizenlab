// The "how recently should users be re-confirmed/re-verified" control shown
// under an enabled authentication method. Backed by `verification_expiry`:
//   0    -> re-verify every 30 minutes (backend MIN_VERIFICATION_EXPIRY)
//   N    -> re-verify if older than N days
//   null -> confirm once, ever
//
// Collapsed by default (a text link); clicking it reveals a compact dropdown.
import React from 'react';

import { Box, Text, Select } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import { linkStyle } from '../shared';

import messages from './messages';

// Default recency to require when an admin first switches it on, in days.
const DEFAULT_EXPIRY_DAYS = 30;

// Fixed day options offered in the dropdown (besides "30 minutes").
const PRESET_DAYS = [7, 30];

interface Props {
  expiry: number | null; // days; `0` = every 30 min, `null` = confirm once, ever
  verb: 'Re-confirm' | 'Re-verify';
  onChange: (expiry: number | null) => void;
}

const RecencyControl = ({ expiry, verb, onChange }: Props) => {
  const { formatMessage } = useIntl();
  const isVerify = verb === 'Re-verify';

  // Collapsed: no recency required yet — offer a compact opt-in link.
  if (expiry === null) {
    return (
      <Text
        as="span"
        m="0"
        fontSize="xs"
        style={linkStyle}
        role="button"
        tabIndex={0}
        onClick={() => onChange(DEFAULT_EXPIRY_DAYS)}
      >
        {formatMessage(
          isVerify
            ? messages.requireRecentVerification
            : messages.requireRecentConfirmation
        )}
      </Text>
    );
  }

  const options = [
    { value: '0', label: formatMessage(messages.thirtyMinutes) },
    ...PRESET_DAYS.map((days) => ({
      value: String(days),
      label: formatMessage(messages.nDays, { days }),
    })),
  ];

  // Preserve a pre-existing custom day value (from the previous free-number
  // input) so opening the form doesn't silently reset it to a preset.
  if (expiry !== 0 && !PRESET_DAYS.includes(expiry)) {
    options.push({
      value: String(expiry),
      label: formatMessage(messages.nDays, { days: expiry }),
    });
  }

  return (
    <Box display="flex" alignItems="center" gap="6px" flexWrap="wrap">
      <Text as="span" m="0" fontSize="xs" color="coolGrey700">
        {formatMessage(
          isVerify ? messages.reverifyLabel : messages.reconfirmLabel
        )}
      </Text>
      <Box width="170px">
        <Select
          size="small"
          value={String(expiry)}
          options={options}
          onChange={(option) => onChange(Number(option.value))}
        />
      </Box>
      <Text
        as="span"
        m="0"
        fontSize="xs"
        style={linkStyle}
        role="button"
        tabIndex={0}
        onClick={() => onChange(null)}
      >
        {formatMessage(messages.remove)}
      </Text>
    </Box>
  );
};

export default RecencyControl;
