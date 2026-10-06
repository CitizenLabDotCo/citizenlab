// Shown instead of the phone row when SMS is not enabled on a platform with
// password login: requiring a confirmed phone number is something the admin
// could get, so we show the toggle switched off and disabled, pointing them to
// their GovSuccess manager.

import React from 'react';

import { Box, Tooltip } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import actionFormMessages from '../../../messages';
import messages from '../messages';

import RequirementToggle from './RequirementToggle';

const PhoneUpsellRow = () => {
  const { formatMessage } = useIntl();

  return (
    // The wrapper gives the tooltip its own parent node, which keeps it
    // reachable by keyboard.
    <Box>
      <Tooltip
        content={formatMessage(messages.phoneUpsellTooltip)}
        placement="top-start"
        theme="dark"
      >
        <Box py="12px" data-testid="phone-upsell-row">
          <RequirementToggle
            icon="tablet"
            label={formatMessage(
              actionFormMessages.requireConfirmedPhoneNumber
            )}
            description={formatMessage(messages.phoneMethodDescription)}
            statusLabel={formatMessage(messages.notConfigured)}
            enabled={false}
            disabled
            onChange={() => {}}
          />
        </Box>
      </Tooltip>
    </Box>
  );
};

export default PhoneUpsellRow;
