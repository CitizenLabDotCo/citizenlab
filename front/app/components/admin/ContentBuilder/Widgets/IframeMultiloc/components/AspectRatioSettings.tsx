import React from 'react';

import { Box, Input, Select } from '@citizenlab/cl2-component-library';
import { useNode } from '@craftjs/core';
import { SupportedLocale, Multiloc } from 'typings';

import { useIntl } from 'utils/cl-intl';

import { ASPECT_RATIO_OPTIONS } from '../constants';
import messages from '../messages';
import { AspectRatioType, EmbedModeType } from '../utils';

interface Props {
  url: string;
  height: number;
  hasError: boolean;
  errorType?: string;
  title?: Multiloc;
  selectedLocale: SupportedLocale;
  embedMode?: EmbedModeType;
  tabletHeight?: number;
  mobileHeight?: number;
  aspectRatio?: AspectRatioType;
  customAspectRatio?: string;
}

const AspectRatioSettings = () => {
  const { formatMessage } = useIntl();
  const {
    actions: { setProp },
    aspectRatio = '16:9',
    customAspectRatio,
  } = useNode((node) => ({
    aspectRatio: node.data.props.aspectRatio || '16:9',
    customAspectRatio: node.data.props.customAspectRatio,
  }));

  const aspectRatioOptions = ASPECT_RATIO_OPTIONS.map((option) => ({
    value: option.value,
    label: formatMessage(messages[option.labelKey]),
  }));

  return (
    <>
      <Box flex="0 0 100%">
        <Select
          labelTooltipText={formatMessage(messages.embedAspectRatioTooltip)}
          label={formatMessage(messages.embedAspectRatioLabel)}
          options={aspectRatioOptions}
          value={aspectRatio}
          onChange={(option) => {
            setProp((props: Props) => {
              props.aspectRatio = option.value;
              if (option.value !== 'custom') {
                props.customAspectRatio = '';
              }
            });
          }}
        />
      </Box>
      {aspectRatio === 'custom' && (
        <Box flex="0 0 100%">
          <Input
            labelTooltipText={formatMessage(
              messages.embedCustomAspectRatioTooltip
            )}
            label={formatMessage(messages.embedCustomAspectRatioLabel)}
            placeholder="16:10"
            type="text"
            value={customAspectRatio || ''}
            onChange={(value) => {
              setProp((props: Props) => {
                props.customAspectRatio = value;
              });
            }}
          />
        </Box>
      )}
    </>
  );
};

export default AspectRatioSettings;
