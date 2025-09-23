import React from 'react';

import { Box, Input } from '@citizenlab/cl2-component-library';
import { useNode } from '@craftjs/core';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';
import { IframeProps } from '../utils';

const FixedHeightSettings = () => {
  const { formatMessage } = useIntl();
  const {
    actions: { setProp },
    height,
    tabletHeight,
    mobileHeight,
  } = useNode((node) => ({
    height: node.data.props.height,
    tabletHeight: node.data.props.tabletHeight,
    mobileHeight: node.data.props.mobileHeight,
  }));

  return (
    <>
      <Box flex="0 0 100%">
        <Input
          labelTooltipText={formatMessage(
            messages.embedDesktopIframeHeightLabelTooltip
          )}
          labelTooltipPlacement="top"
          label={formatMessage(messages.embedDesktopIframeHeightLabel)}
          placeholder={formatMessage(messages.iframeHeightPlaceholder)}
          type="number"
          value={height}
          onChange={(value) => {
            setProp(
              (props: IframeProps) => (props.height = parseInt(value, 10) || 0)
            );
          }}
        />
      </Box>
      <Box flex="0 0 100%">
        <Input
          labelTooltipText={formatMessage(messages.embedTabletHeightTooltip)}
          labelTooltipPlacement="top"
          label={formatMessage(messages.embedTabletHeightLabel)}
          placeholder="600"
          type="number"
          value={tabletHeight || ''}
          onChange={(value) => {
            setProp(
              (props: IframeProps) =>
                (props.tabletHeight = value ? parseInt(value, 10) : undefined)
            );
          }}
        />
      </Box>
      <Box flex="0 0 100%">
        <Input
          labelTooltipText={formatMessage(messages.embedMobileHeightTooltip)}
          label={formatMessage(messages.embedMobileHeightLabel)}
          labelTooltipPlacement="top"
          placeholder="400"
          type="number"
          value={mobileHeight || ''}
          onChange={(value) => {
            setProp(
              (props: IframeProps) =>
                (props.mobileHeight = value ? parseInt(value, 10) : undefined)
            );
          }}
        />
      </Box>
    </>
  );
};

export default FixedHeightSettings;
