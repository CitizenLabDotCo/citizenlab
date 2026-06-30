import React from 'react';

import {
  Box,
  Text,
  Icon,
  IconTooltip,
  Toggle,
  colors,
} from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import { AuthMethodKey } from '../types';

import { METHOD_META, AUTH_METHOD_LABELS } from './constants';
import messages from './messages';
import RecencyControl from './RecencyControl';
import { linkStyle } from './shared';

interface Props {
  methodKey: AuthMethodKey;
  enabled: boolean;
  expiry: number | null;
  available: boolean;
  unavailableReason: string;
  // Locked on because it is the only method still enabled — a permission must
  // always keep at least one. The toggle is disabled and explains why.
  locked?: boolean;
  onChange: (next: { enabled: boolean; expiry: number | null }) => void;
  onShowReturnedFields?: () => void;
}

const MethodRow = ({
  methodKey,
  enabled: stateEnabled,
  expiry,
  available,
  unavailableReason,
  locked = false,
  onChange,
  onShowReturnedFields,
}: Props) => {
  const { formatMessage } = useIntl();
  const meta = METHOD_META[methodKey];
  const enabled = available && stateEnabled;

  return (
    <Box py="10px">
      <Toggle
        checked={enabled}
        disabled={!available || locked}
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
                {formatMessage(AUTH_METHOD_LABELS[methodKey])}
              </Text>
              {locked && (
                <IconTooltip
                  content={formatMessage(messages.atLeastOneMethodMustStayEnabled)}
                  iconSize="14px"
                />
              )}
            </Box>
            <Text as="span" m="0" fontSize="xs" color="coolGrey600">
              {available ? formatMessage(meta.description) : unavailableReason}
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
            {formatMessage(messages.seeWhichFieldsThisReturns)}
          </Text>
        </Box>
      )}
      {/* TODO: implement recency control for email (and phone numbers when available) */}
      {enabled && methodKey === 'verification' && (
        <Box ml="42px" mt="6px">
          <RecencyControl
            expiry={expiry}
            // verb={methodKey === 'verification' ? 'Re-verify' : 'Re-confirm'}
            verb={'Re-verify'}
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
