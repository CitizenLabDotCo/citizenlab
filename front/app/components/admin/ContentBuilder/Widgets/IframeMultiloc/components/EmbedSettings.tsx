import React from 'react';

import {
  Box,
  IconTooltip,
  Input,
  Text,
  Label,
  Radio,
} from '@citizenlab/cl2-component-library';
import { useNode } from '@craftjs/core';
import { SupportedLocale, Multiloc } from 'typings';

import { CONTENT_BUILDER_ERROR_EVENT } from 'components/admin/ContentBuilder/constants';
import Error from 'components/UI/Error';
import InputMultilocWithLocaleSwitcherWrapper from 'components/UI/InputMultilocWithLocaleSwitcher';

import { useIntl } from 'utils/cl-intl';
import eventEmitter from 'utils/eventEmitter';
import { isValidUrl } from 'utils/validate';

import sharedMessages from '../../../messages';
import messages from '../messages';
import { AspectRatioType } from '../utils';

import AspectRatioSettings from './AspectRatioSettings';
import FixedHeightSettings from './FixedHeightSettings';

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

const EmbedSettings = () => {
  const { formatMessage } = useIntl();
  const {
    actions: { setProp },
    url,
    id,
    hasError,
    errorType,
    title,
    selectedLocale,
    embedMode = 'fixed',
  } = useNode((node) => ({
    url: node.data.props.url,
    id: node.id,
    title: node.data.props.title,
    hasError: node.data.props.hasError,
    errorType: node.data.props.errorType,
    selectedLocale: node.data.props.selectedLocale,
    embedMode: node.data.props.embedMode || 'fixed',
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
            onChange={() =>
              setProp((props: Props) => (props.embedMode = 'fixed'))
            }
            label={formatMessage(messages.embedModeFixedHeight)}
          />
          <Radio
            id="embed-mode-aspect"
            name="embedMode"
            value="aspectRatio"
            currentValue={embedMode}
            onChange={() =>
              setProp((props: Props) => (props.embedMode = 'aspectRatio'))
            }
            label={formatMessage(messages.embedModeAspectRatio)}
          />
        </Box>
      </Box>

      {/* Fixed Height Mode Settings */}
      {embedMode === 'fixed' && <FixedHeightSettings />}

      {/* Aspect Ratio Mode Settings */}
      {embedMode === 'aspectRatio' && <AspectRatioSettings />}

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
};

export default EmbedSettings;
