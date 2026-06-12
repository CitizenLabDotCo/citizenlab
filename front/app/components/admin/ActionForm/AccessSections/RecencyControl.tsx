// The "re-confirm/re-verify if older than N days" control shown under an
// enabled authentication method.

import React from 'react';

import { Box, Text, Input } from '@citizenlab/cl2-component-library';

import { linkStyle } from './shared';

// Default recency to require when an admin first switches it on, in days.
const DEFAULT_EXPIRY_DAYS = 30;

interface Props {
  expiry: number | null; // days; `null` = confirm once, ever
  verb: string; // "Re-confirm" / "Re-verify"
  onChange: (expiry: number | null) => void;
}

const RecencyControl = ({ expiry, verb, onChange }: Props) => {
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
        + Require recent {verb === 'Re-verify' ? 'verification' : 'confirmation'}
      </Text>
    );
  }

  return (
    <Box display="flex" alignItems="center" gap="6px" flexWrap="wrap">
      <Text as="span" m="0" fontSize="xs" color="coolGrey700">
        {verb} if older than
      </Text>
      <Box width="64px">
        <Input
          type="number"
          size="small"
          min="1"
          value={String(expiry)}
          onChange={(value) => onChange(Math.max(1, Number(value) || 1))}
        />
      </Box>
      <Text as="span" m="0" fontSize="xs" color="coolGrey700">
        days
      </Text>
      <Text
        as="span"
        m="0"
        fontSize="xs"
        style={linkStyle}
        role="button"
        tabIndex={0}
        onClick={() => onChange(null)}
      >
        remove
      </Text>
    </Box>
  );
};

export default RecencyControl;
