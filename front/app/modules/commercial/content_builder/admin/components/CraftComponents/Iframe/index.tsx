import React from 'react';

// components
import {
  Box,
  IconTooltip,
  Input,
  Text,
} from '@citizenlab/cl2-component-library';
import Error from 'components/UI/Error';

// intl
import messages from '../../../messages';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';

// craft
import { useNode } from '@craftjs/core';

// events
import eventEmitter from 'utils/eventEmitter';
import { CONTENT_BUILDER_ERROR_EVENT } from '../../../containers';

// types
import { Locale } from 'typings';

import { isValidUrl } from './utils';

interface Props {
  url: string;
  height: number;
  hasError: boolean;
  errorType?: string;
  title?: string;
  selectedLocale: Locale;
}

const Iframe = ({ url, height, hasError, title }: Props) => {
  return (
    <Box id="e2e-content-builder-iframe-component" minHeight="26px">
      {!hasError && url && (
        <iframe src={url} title={title} width="100%" height={height} />
      )}
    </Box>
  );
};

const IframeSettings = injectIntl(({ intl: { formatMessage } }) => {
  const {
    actions: { setProp },
    url,
    height,
    id,
    hasError,
    errorType,
    title,
    selectedLocale,
  } = useNode((node) => ({
    url: node.data.props.url,
    height: node.data.props.height,
    id: node.id,
    title: node.data.props.title,
    hasError: node.data.props.hasError,
    errorType: node.data.props.errorType,
    selectedLocale: node.data.props.selectedLocale,
  }));

  const handleChange = (value: string) => {
    const validation = isValidUrl(value);
    setProp((props) => (props.url = value));
    setProp((props) => (props.errorType = validation[1]));
    setProp((props) => (props.hasError = !validation[0]));
    eventEmitter.emit(CONTENT_BUILDER_ERROR_EVENT, {
      [id]: { hasError: !validation[0], selectedLocale },
    });
  };

  const invalidWhiteListError = (
    <FormattedMessage
      {...messages.iframeInvalidWhitelistUrlErrorMessage}
      values={{
        visitLinkMessage: (
          <a
            href={formatMessage(messages.iframeSupportLink)}
            target="_blank"
            rel="noreferrer"
          >
            {formatMessage(messages.iframeEmbedVisitLinkMessage)}
          </a>
        ),
      }}
    />
  );

  return (
    <Box flexWrap="wrap" display="flex" gap="16px" marginBottom="20px">
      <Text variant="bodyM">{formatMessage(messages.iframeDescription)}</Text>
      <Box flex="0 0 100%">
        <Input
          id="e2e-content-builder-iframe-url-input"
          labelTooltipText={formatMessage(messages.embedIframeUrlLabelTooltip)}
          label={formatMessage(messages.embedIframeUrlLabel)}
          placeholder={formatMessage(messages.urlPlaceholder)}
          type="text"
          value={url}
          onChange={(value) => {
            handleChange(value);
          }}
        />
        {hasError && (
          <Error
            marginTop="4px"
            text={
              errorType === 'invalidUrl'
                ? formatMessage(messages.iframeInvalidUrlErrorMessage)
                : invalidWhiteListError
            }
          />
        )}
      </Box>
      <Box flex="0 0 100%">
        <Input
          labelTooltipText={formatMessage(
            messages.embedIframeHeightLabelTooltip
          )}
          label={formatMessage(messages.embedIframeHeightLabel)}
          placeholder={formatMessage(messages.iframeHeightPlaceholder)}
          type="number"
          value={height}
          onChange={(value) => {
            setProp((props) => (props.height = value));
          }}
        />
      </Box>
      <Box flex="0 0 100%">
        <Input
          type="text"
          id="e2e-content-builder-iframe-title-input"
          onChange={(value) => {
            setProp((props) => (props.title = value));
          }}
          value={title}
          label={
            <span>
              {formatMessage(messages.embedIframeTitleLabel)}{' '}
              <IconTooltip
                display="inline"
                icon="info-solid"
                content={formatMessage(messages.embedIframeTitleTooltip)}
              />
            </span>
          }
        />
      </Box>
    </Box>
  );
});

Iframe.craft = {
  props: {
    url: '',
    height: '',
  },
  related: {
    settings: IframeSettings,
  },
};

export default Iframe;
