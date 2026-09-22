import React from 'react';

import {
  Box,
  Icon,
  Text,
  Tooltip,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';
import widgetMessages from './Widgets/messages';

const LockedZonePill = () => (
  <Tooltip
    content={
      <Box>
        <FormattedMessage {...widgetMessages.lockedHeaderNote} />
      </Box>
    }
  >
    <Box
      display="inline-flex"
      alignItems="center"
      gap="4px"
      px="8px"
      py="2px"
      bgColor={colors.white}
      border={`1px solid ${colors.divider}`}
      borderRadius={stylingConsts.borderRadius}
    >
      <Icon
        name="lock"
        width="14px"
        height="14px"
        fill={colors.textSecondary}
      />
      <Text m="0px" fontSize="xs" color="textSecondary" data-cy="locked-zone-pill-tooltip">
        <FormattedMessage {...messages.lockedZoneLabel} />
      </Text>
    </Box>
  </Tooltip>
);

export default LockedZonePill;
