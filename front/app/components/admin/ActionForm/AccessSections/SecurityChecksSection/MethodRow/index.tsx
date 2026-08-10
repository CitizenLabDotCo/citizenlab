import React from 'react';

import {
  Box,
  Text,
  Icon,
  Toggle,
  colors,
} from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import { AuthMethodKey } from '../../../types';
import { METHOD_META, AUTH_METHOD_LABELS } from '../../constants';
import RecencyControl from '../../RecencyControl';

interface Props {
  methodKey: AuthMethodKey;
  enabled: boolean;
  expiry: number | null;
  // Why the check can't be used on this platform. `undefined` = it can.
  unavailableReason?: string;
  onChange: (next: { enabled: boolean; expiry: number | null }) => void;
}

const MethodRow = ({
  methodKey,
  enabled: stateEnabled,
  expiry,
  unavailableReason,
  onChange,
}: Props) => {
  const { formatMessage } = useIntl();
  const meta = METHOD_META[methodKey];
  const available = !unavailableReason;
  const enabled = available && stateEnabled;

  return (
    <Box py="10px">
      <Toggle
        checked={enabled}
        disabled={!available}
        onChange={() => onChange({ enabled: !stateEnabled, expiry })}
        size="small"
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
                {formatMessage(AUTH_METHOD_LABELS[methodKey])}
              </Text>
            </Box>
            <Text as="span" m="0" fontSize="xs" color="coolGrey600">
              {unavailableReason ?? formatMessage(meta.description)}
            </Text>
          </Box>
        }
      />
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
