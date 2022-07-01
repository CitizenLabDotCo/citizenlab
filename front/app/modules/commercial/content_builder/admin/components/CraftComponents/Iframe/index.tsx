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
import { injectIntl } from 'utils/cl-intl';

// craft
import { useNode } from '@craftjs/core';

// events
import eventEmitter from 'utils/eventEmitter';
import { CONTENT_BUILDER_ERROR_EVENT } from '../../../containers';

// types
import { Locale } from 'typings';
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

  return (
    <Box flexWrap="wrap" display="flex" gap="16px" marginBottom="20px">
      <Text variant="bodyM">{formatMessage(messages.iframeDescription)}</Text>
      <Box flex="0 0 100%">
        <Input
          id="e2e-content-builder-iframe-url-input"
          label={
            <span>
              {formatMessage(messages.embedIframeUrlLabel)}{' '}
              <IconTooltip
                icon="info3"
                content={formatMessage(messages.embedIframeUrlLabelTooltip)}
              />
            </span>
          }
          placeholder={formatMessage(messages.iframeUrlPlaceholder)}
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
                : formatMessage(messages.iframeWhitelistUrlErrorMessage)
            }
          />
        )}
      </Box>
      <Box flex="0 0 100%">
        <Input
          label={
            <span>
              {formatMessage(messages.embedIframeHeightLabel)}{' '}
              <IconTooltip
                icon="info3"
                content={formatMessage(messages.embedIframeHeightLabelTooltip)}
              />
            </span>
          }
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
                icon="info3"
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

/*
 * Function to validate embed URL against white list
 * Returns: boolean value whether URL input string is valid or not
 */
const isValidUrl = (url: string) => {
  // Used this reference for generating a valid URL regex:
  // https://tutorial.eyehunts.com/js/url-regex-validation-javascript-example-code/
  const validUrlRegex =
    /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/g;
  let invalidUrl = !validUrlRegex.test(url);
  if (invalidUrl) {
    return [false, 'invalidUrl'];
  }

  const urlWhiteList = [
    /^https:\/\/(.+\.)typeform\.com\/to\//,
    /^https:\/\/(.+\.)typeform\.com\/to\//,
    /^https:\/\/widget\.surveymonkey\.com\/collect\/website\/js\/.*\.js/,
    /^https:\/\/docs.google.com\/forms\/d\/e\/.*\/viewform\?embedded=true/,
    /^https:\/\/surveys.enalyzer.com\/?\?pid=.*/,
    /^https:\/\/(www\.)?survey-xact\.dk\/LinkCollector\?key=.*/,
    /^https:\/\/(.+\.)qualtrics\.com\/jfe\/form\//,
    /^https:\/\/(www\.)?smartsurvey\.co\.uk\//,
    /^https:\/\/(.+\.)(microsoft|office)\.com\//,
    /^https:\/\/(www\.)?eventbrite\.com\/static\/widgets\//,
    /^https:\/\/(www\.)?arcgis\.com\//,
    /^https:\/\/public\.tableau\.com\//,
    /^https:\/\/datastudio\.google\.com\/embed\//,
    /^https:\/\/app\.powerbi\.com\//,
    /^https:\/\/static\.ctctcdn\.com\/js\//,
    /^https:\/\/(www\.)?instagram\.com\//,
    /^https:\/\/platform\.twitter\.com\//,
    /^https:\/\/.+\.konveio\.com\//,
    /^https:\/\/(www\.)?facebook\.com\//,
    /^https:\/\/(?:www\.)?youtu(?:be\.com\/(?:watch\?v=|embed\/)|\.be\/)([\w\-_]*)/,
    /^https:\/\/(?:www\.)?(?:player\.vimeo\.com\/video|vimeo\.com)\/(\d+)(?:|\/\?)/,
    /^https:\/\/(?:www\.)?dailymotion\.com\/embed\/video\/?(.+)/,
    /^https:\/\/?media\.videotool\.dk\/?\?vn=[\w-]+/,
    /^https:\/\/(?:www\.)?dreambroker\.com\/channel\/([\w-]+)\/iframe\//,
    /^https:\/\/(.+)?(wistia\.com|wi\.st)\/.*\//,
    /^https:\/\/(.+\.)(welcomesyourfeedback.net|snapsurveys.com)\//,
  ];

  invalidUrl = !urlWhiteList.some((rx) => rx.test(url));

  if (invalidUrl) {
    return [false, 'whitelist'];
  } else {
    return [true, 'whitelist'];
  }
};

export default Iframe;
