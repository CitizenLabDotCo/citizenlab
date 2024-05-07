import React from 'react';

import {
  colors,
  stylingConsts,
  Box,
  Text,
  Icon,
  Toggle,
} from '@citizenlab/cl2-component-library';
import { useNode } from '@craftjs/core';

import activeUsersMessages from 'components/admin/GraphCards/ActiveUsersCard/messages';

import { useIntl } from 'utils/cl-intl';

import ChartWidgetSettings from '../_shared/ChartWidgetSettings';

const _ChartWidgetSettings = () => {
  const { formatMessage } = useIntl();
  const {
    actions: { setProp },
    comparePreviousPeriod,
  } = useNode((node) => ({
    comparePreviousPeriod: node.data.props.comparePreviousPeriod,
  }));

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
      <Toggle
        label={'TODO'}
        checked={!!comparePreviousPeriod}
        onChange={() => {
          setProp((props) => {
            props.comparePreviousPeriod = !comparePreviousPeriod;
          });
        }}
      />
    </Box>
  );
};

export default _ChartWidgetSettings;
