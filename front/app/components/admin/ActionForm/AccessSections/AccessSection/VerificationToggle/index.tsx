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

import { AUTH_METHOD_LABELS } from '../../constants';
import RecencyControl from '../../RecencyControl';

import messages from './messages';

interface Props {
  enabled: boolean;
  expiry: number | null;
  // Whether the platform has a verification method configured at all.
  available: boolean;
  // Locked on because it is the only proof still enabled — a permission must
  // always keep at least one. The toggle is disabled and explains why.
  locked?: boolean;
  onChange: (next: { enabled: boolean; expiry: number | null }) => void;
}

const VerificationToggle = ({
  enabled,
  expiry,
  available,
  locked = false,
  onChange,
}: Props) => {
  const { formatMessage } = useIntl();
  const on = available && enabled;

  return (
    <Box py="10px">
      <Toggle
        checked={on}
        disabled={!available || locked}
        onChange={() => onChange({ enabled: !enabled, expiry })}
        size="small"
        label={
          <Box ml="8px">
            <Box display="flex" alignItems="center" gap="6px">
              <Icon
                name="shield-checkered"
                width="16px"
                height="16px"
                fill={on ? colors.teal500 : colors.coolGrey500}
              />
              <Text
                as="span"
                m="0"
                fontSize="s"
                fontWeight="semi-bold"
                color={available ? 'primary' : 'coolGrey500'}
              >
                {formatMessage(AUTH_METHOD_LABELS.verification)}
              </Text>
              {locked && (
                <IconTooltip
                  content={formatMessage(
                    messages.atLeastOneMethodMustStayEnabled
                  )}
                  iconSize="14px"
                />
              )}
            </Box>
            <Text as="span" m="0" fontSize="xs" color="coolGrey600">
              {formatMessage(
                available
                  ? messages.verificationMethodDescription
                  : messages.unavailableVerification
              )}
            </Text>
          </Box>
        }
      />
      {on && (
        <Box ml="42px" mt="6px">
          <RecencyControl
            expiry={expiry}
            verb="Re-verify"
            onChange={(nextExpiry) => onChange({ enabled, expiry: nextExpiry })}
          />
        </Box>
      )}
    </Box>
  );
};

export default VerificationToggle;
