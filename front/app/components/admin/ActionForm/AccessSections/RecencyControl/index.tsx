// The "how recently should users be re-confirmed/re-verified" control shown
// under an enabled authentication method. Backed by `verification_expiry`:
//   0    -> re-verify every 30 minutes (backend MIN_VERIFICATION_EXPIRY)
//   N    -> re-verify if older than N days
//   null -> confirm once, ever
import React from 'react';

import { Box, Text, Select } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

// Fixed day options offered in the dropdown (besides "30 minutes" and "once").
const PRESET_DAYS = [7, 30];

// Sentinel used for the `null` ("once is enough") option, since a Select value
// must be a string.
const ONCE = 'once';

interface Props {
  expiry: number | null; // days; `0` = every 30 min, `null` = confirm once, ever
  verb: 'Re-confirm' | 'Re-verify';
  onChange: (expiry: number | null) => void;
}

const expiryToValue = (expiry: number | null): string =>
  expiry === null ? ONCE : String(expiry);

const valueToExpiry = (value: string): number | null =>
  value === ONCE ? null : Number(value);

const RecencyControl = ({ expiry, verb, onChange }: Props) => {
  const { formatMessage } = useIntl();

  const options = [
    { value: '0', label: formatMessage(messages.inTheLast30Minutes) },
    ...PRESET_DAYS.map((days) => ({
      value: String(days),
      label: formatMessage(messages.inTheLastNDays, { days }),
    })),
    { value: ONCE, label: formatMessage(messages.onceIsEnough) },
  ];

  // Preserve a pre-existing custom day value (from the previous free-number
  // input) so opening the form doesn't silently reset it to a preset.
  if (expiry !== null && expiry !== 0 && !PRESET_DAYS.includes(expiry)) {
    options.splice(options.length - 1, 0, {
      value: String(expiry),
      label: formatMessage(messages.inTheLastNDays, { days: expiry }),
    });
  }

  return (
    <Box display="flex" alignItems="center" gap="8px" flexWrap="wrap">
      <Text as="span" m="0" fontSize="xs" color="coolGrey700">
        {formatMessage(
          verb === 'Re-verify'
            ? messages.howRecentlyVerified
            : messages.howRecentlyConfirmed
        )}
      </Text>
      <Box width="200px">
        <Select
          size="small"
          value={expiryToValue(expiry)}
          options={options}
          onChange={(option) => onChange(valueToExpiry(option.value))}
        />
      </Box>
    </Box>
  );
};

export default RecencyControl;
