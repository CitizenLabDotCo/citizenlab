// A single authentication-method row: a toggle with its description, the
// "see which fields this returns" link (verification only), and the recency
// control once enabled.

import React from 'react';

import {
  Box,
  Text,
  Icon,
  IconNames,
  Toggle,
  colors,
} from '@citizenlab/cl2-component-library';

import { AUTH_METHOD_LABELS } from '../data';
import { AuthMethodKey } from '../types';

import RecencyControl from './RecencyControl';
import { linkStyle } from './shared';

const METHOD_META: Record<
  AuthMethodKey,
  { icon: IconNames; description: string }
> = {
  email: {
    icon: 'email',
    description: 'Participant confirms an email address with a one-time code.',
  },
  verification: {
    icon: 'shield-checkered',
    description: 'Participant proves their identity through an external register.',
  },
};

interface Props {
  methodKey: AuthMethodKey;
  enabled: boolean;
  expiry: number | null;
  available: boolean;
  unavailableReason: string;
  onChange: (next: { enabled: boolean; expiry: number | null }) => void;
  onShowReturnedFields?: () => void;
}

const MethodRow = ({
  methodKey,
  enabled: stateEnabled,
  expiry,
  available,
  unavailableReason,
  onChange,
  onShowReturnedFields,
}: Props) => {
  const meta = METHOD_META[methodKey];
  const enabled = available && stateEnabled;

  return (
    <Box py="10px">
      <Toggle
        checked={enabled}
        disabled={!available}
        onChange={() => onChange({ enabled: !stateEnabled, expiry })}
        label={
          <Box ml="8px">
            <Box display="flex" alignItems="center" gap="6px">
              <Icon
                name={meta.icon}
                width="16px"
                height="16px"
                fill={enabled ? colors.teal500 : colors.coolGrey500}
              />
              <Text
                as="span"
                m="0"
                fontSize="s"
                fontWeight="semi-bold"
                color={available ? 'primary' : 'coolGrey500'}
              >
                {AUTH_METHOD_LABELS[methodKey]}
              </Text>
            </Box>
            <Text as="span" m="0" fontSize="xs" color="coolGrey600">
              {available ? meta.description : unavailableReason}
            </Text>
          </Box>
        }
      />
      {available && methodKey === 'verification' && onShowReturnedFields && (
        <Box ml="42px" mt="6px">
          <Text
            as="span"
            m="0"
            fontSize="xs"
            style={linkStyle}
            role="button"
            tabIndex={0}
            onClick={onShowReturnedFields}
          >
            See which fields this returns
          </Text>
        </Box>
      )}
      {enabled && (
        <Box ml="42px" mt="6px">
          <RecencyControl
            expiry={expiry}
            verb={methodKey === 'verification' ? 'Re-verify' : 'Re-confirm'}
            onChange={(nextExpiry) =>
              onChange({ enabled: stateEnabled, expiry: nextExpiry })
            }
          />
        </Box>
      )}
    </Box>
  );
};

export default MethodRow;
