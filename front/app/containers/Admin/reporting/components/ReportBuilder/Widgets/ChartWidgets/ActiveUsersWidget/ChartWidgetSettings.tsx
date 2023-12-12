import React from 'react';

// styling
import {
  colors,
  stylingConsts,
  Box,
  Text,
  Icon,
} from '@citizenlab/cl2-component-library';

// components
import ChartWidgetSettings from '../_shared/ChartWidgetSettings';

// i18n
import { useIntl } from 'utils/cl-intl';
import activeUsersMessages from 'components/admin/GraphCards/ActiveUsersCard/messages';

const _ChartWidgetSettings = () => {
  const { formatMessage } = useIntl();

  return (
    <Box>
      <Box
        bgColor={colors.teal100}
        borderRadius={stylingConsts.borderRadius}
        px="12px"
        mt="0px"
        role="alert"
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Text variant="bodyS" color="textSecondary">
          <Icon
            name="info-outline"
            width="16px"
            height="16px"
            mr="4px"
            fill="textSecondary"
            display="inline"
          />
          {formatMessage(activeUsersMessages.cardTitleTooltipMessage)}
        </Text>
      </Box>
      <ChartWidgetSettings />
    </Box>
  );
};

export default _ChartWidgetSettings;
