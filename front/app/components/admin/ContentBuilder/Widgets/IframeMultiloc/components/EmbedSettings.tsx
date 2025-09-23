import React from 'react';

import {
  Box,
  IconTooltip,
  Input,
  Text,
  Label,
  Radio,
  Select,
} from '@citizenlab/cl2-component-library';
import { useNode } from '@craftjs/core';
import { SupportedLocale, Multiloc } from 'typings';

import { CONTENT_BUILDER_ERROR_EVENT } from 'components/admin/ContentBuilder/constants';
import Error from 'components/UI/Error';
import InputMultilocWithLocaleSwitcherWrapper from 'components/UI/InputMultilocWithLocaleSwitcher';

import { injectIntl } from 'utils/cl-intl';
import eventEmitter from 'utils/eventEmitter';
import { isValidUrl } from 'utils/validate';

import sharedMessages from '../../../messages';
import { ASPECT_RATIO_OPTIONS } from '../constants';
import messages from '../messages';
import { AspectRatioType } from '../utils';

interface Props {
  url: string;
  height: number;
  hasError: boolean;
  errorType?: string;
  title?: Multiloc;
  selectedLocale: SupportedLocale;
  embedMode?: 'fixed' | 'aspectRatio';
  tabletHeight?: number;
  mobileHeight?: number;
  aspectRatio?: AspectRatioType;
  customAspectRatio?: string;
}

const EmbedSettings = injectIntl(({ intl: { formatMessage } }) => {
  const {
    actions: { setProp },
    url,
    height,
    id,
    hasError,
    errorType,
    title,
    selectedLocale,
    embedMode = 'fixed',
    tabletHeight,
    mobileHeight,
    aspectRatio = '16:9',
    customAspectRatio,
  } = useNode((node) => ({
    url: node.data.props.url,
    height: node.data.props.height,
    id: node.id,
    title: node.data.props.title,
    hasError: node.data.props.hasError,
    errorType: node.data.props.errorType,
    selectedLocale: node.data.props.selectedLocale,
    embedMode: node.data.props.embedMode || 'fixed',
    tabletHeight: node.data.props.tabletHeight,
    mobileHeight: node.data.props.mobileHeight,
    aspectRatio: node.data.props.aspectRatio || '16:9',
    customAspectRatio: node.data.props.customAspectRatio,
  }));

  const handleUrlChange = (value: string) => {
    setProp((props: Props) => {
      props.url = value;
    });
  };

  const handleUrlBlur = () => {
    const validation = isValidUrl(url);

    setProp((props: Props) => {
      props.errorType = 'invalidUrl';
      props.hasError = !validation;
    });

    eventEmitter.emit(CONTENT_BUILDER_ERROR_EVENT, {
      [id]: { hasError: !validation, selectedLocale },
    });
  };

  const aspectRatioOptions = ASPECT_RATIO_OPTIONS.map((option) => ({
    value: option.value,
    label: formatMessage(messages[option.labelKey]),
  }));

  return (
    <Box flexWrap="wrap" display="flex" gap="16px" marginBottom="20px">
      <Text variant="bodyM">{formatMessage(messages.iframeDescription)}</Text>

      {/* URL Input */}
      <Box flex="0 0 100%">
        <Input
          id="e2e-content-builder-iframe-url-input"
          labelTooltipText={formatMessage(messages.embedIframeUrlLabelTooltip)}
          label={formatMessage(messages.embedIframeUrlLabel)}
          placeholder={formatMessage(sharedMessages.urlPlaceholder)}
          type="text"
          value={url}
          onChange={handleUrlChange}
          onBlur={handleUrlBlur}
        />
        {hasError && errorType === 'invalidUrl' && (
          <Error
            marginTop="4px"
            text={formatMessage(messages.iframeInvalidUrlErrorMessage)}
          />
        )}
      </Box>

      {/* Embed Mode Selection */}
      <Box flex="0 0 100%">
        <Label>
          <span>
            {formatMessage(messages.embedModeLabel)}{' '}
            <IconTooltip
              display="inline"
              icon="info-solid"
              content={formatMessage(messages.embedModeTooltip)}
            />
          </span>
        </Label>
        <Box display="flex" gap="16px" marginTop="8px">
          <Radio
            id="embed-mode-fixed"
            name="embedMode"
            value="fixed"
            currentValue={embedMode}
            onChange={() => setProp((props) => (props.embedMode = 'fixed'))}
            label={formatMessage(messages.embedModeFixedHeight)}
          />
          <Radio
            id="embed-mode-aspect"
            name="embedMode"
            value="aspectRatio"
            currentValue={embedMode}
            onChange={() =>
              setProp((props) => (props.embedMode = 'aspectRatio'))
            }
            label={formatMessage(messages.embedModeAspectRatio)}
          />
        </Box>
      </Box>

      {/* Fixed Height Mode Settings */}
      {embedMode === 'fixed' && (
        <>
          <Box flex="0 0 100%">
            <Input
              labelTooltipText={formatMessage(
                messages.embedIframeHeightLabelTooltip
              )}
              label={formatMessage(messages.embedDesktopIframeHeightLabel)}
              placeholder={formatMessage(messages.iframeHeightPlaceholder)}
              type="number"
              value={height}
              onChange={(value) => {
                setProp((props) => (props.height = value));
              }}
            />
          </Box>
          <Box flex="0 0 48%">
            <Input
              labelTooltipText={formatMessage(
                messages.embedTabletHeightTooltip
              )}
              label={formatMessage(messages.embedTabletHeightLabel)}
              placeholder="600"
              type="number"
              value={tabletHeight || ''}
              onChange={(value) => {
                setProp(
                  (props) =>
                    (props.tabletHeight = value
                      ? parseInt(value, 10)
                      : undefined)
                );
              }}
            />
          </Box>
          <Box flex="0 0 48%">
            <Input
              labelTooltipText={formatMessage(
                messages.embedMobileHeightTooltip
              )}
              label={formatMessage(messages.embedMobileHeightLabel)}
              placeholder="400"
              type="number"
              value={mobileHeight || ''}
              onChange={(value) => {
                setProp(
                  (props) =>
                    (props.mobileHeight = value
                      ? parseInt(value, 10)
                      : undefined)
                );
              }}
            />
          </Box>
        </>
      )}

      {/* Aspect Ratio Mode Settings */}
      {embedMode === 'aspectRatio' && (
        <>
          <Box flex="0 0 100%">
            <Select
              labelTooltipText={formatMessage(messages.embedAspectRatioTooltip)}
              label={formatMessage(messages.embedAspectRatioLabel)}
              options={aspectRatioOptions}
              value={aspectRatio}
              onChange={(option) => {
                setProp((props) => {
                  props.aspectRatio = option.value as any;
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
                  setProp((props) => {
                    props.customAspectRatio = value;
                  });
                }}
              />
            </Box>
          )}
        </>
      )}

      {/* Title Input */}
      <Box flex="0 0 100%">
        <Label htmlFor="e2e-content-builder-iframe-title-input">
          <span>
            {formatMessage(messages.embedIframeTitleLabel)}{' '}
            <IconTooltip
              display="inline"
              icon="info-solid"
              content={formatMessage(messages.embedIframeTitleTooltip)}
            />
          </span>
        </Label>
        <InputMultilocWithLocaleSwitcherWrapper
          type="text"
          id="e2e-content-builder-iframe-title-input"
          onChange={(value) => {
            setProp((props: Props) => (props.title = value));
          }}
          valueMultiloc={title}
        />
      </Box>
    </Box>
  );
});

export default EmbedSettings;
