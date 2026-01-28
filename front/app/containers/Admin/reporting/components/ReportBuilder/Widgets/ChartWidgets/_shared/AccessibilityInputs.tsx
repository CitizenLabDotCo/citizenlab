import React from 'react';

import { Box, IconTooltip, Text } from '@citizenlab/cl2-component-library';
import { useNode } from '@craftjs/core';
import { Multiloc } from 'typings';

import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';
import { ChartWidgetProps } from '../typings';

export const AccessibilityInputs = () => {
  const { formatMessage } = useIntl();

  const {
    actions: { setProp },
    ariaLabel,
    description,
    view,
  } = useNode((node) => ({
    ariaLabel: node.data.props.ariaLabel,
    description: node.data.props.description,
    view: node.data.props.view,
  }));

  // hide accessibility inputs when view is set to "table"
  if (view === 'table') {
    return null;
  }

  const setAriaLabel = (value: Multiloc) => {
    setProp((props: ChartWidgetProps) => {
      props.ariaLabel = value;
    });
  };

  const setDescription = (value: Multiloc) => {
    setProp((props: ChartWidgetProps) => {
      props.description = value;
    });
  };

  return (
    <Box mt="48px" mb="24px">
      <Text color="grey800" fontWeight="semi-bold" fontSize="l">
        {formatMessage(messages.accessibility)}
      </Text>
      <Text color="coolGrey600" fontSize="m" mb="16px">
        {formatMessage(messages.accessibilityDescription)}
      </Text>
      <Box>
        <Box mb="12px">
          <InputMultilocWithLocaleSwitcher
            id="e2e-analytics-chart-widget-aria-label"
            label={
              <Text color="coolGrey600" mb="4px" fontSize="m" display="flex">
                {formatMessage(messages.analyticsChartAriaLabel)}
                <IconTooltip
                  content={formatMessage(
                    messages.analyticsChartAriaLabelTooltip3
                  )}
                />
              </Text>
            }
            type="text"
            valueMultiloc={ariaLabel}
            onChange={setAriaLabel}
          />
        </Box>
        <Box mb="12px">
          <InputMultilocWithLocaleSwitcher
            id="e2e-analytics-chart-widget-description"
            label={
              <Text color="coolGrey600" mb="4px" fontSize="m" display="flex">
                {formatMessage(messages.analyticsChartDescription)}{' '}
                <IconTooltip
                  content={formatMessage(
                    messages.analyticsChartDescriptionTooltip3
                  )}
                />
              </Text>
            }
            type="text"
            valueMultiloc={description}
            onChange={setDescription}
          />
        </Box>
      </Box>
    </Box>
  );
};
