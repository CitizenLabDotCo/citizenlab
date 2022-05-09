import React from 'react';

// components
import { Box, IconTooltip, Input } from '@citizenlab/cl2-component-library';
import Error from 'components/UI/Error';

// intl
import messages from '../../../messages';
import { injectIntl } from 'utils/cl-intl';

// craft
import { useNode } from '@craftjs/core';

// events
import eventEmitter from 'utils/eventEmitter';

interface Props {
  url: string;
  height: number;
  hasError: boolean;
  errorType?: string;
  title?: string;
}

const Iframe = ({ url, height, hasError, title }: Props) => {
  return (
    <Box minHeight="26px">
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
  } = useNode((node) => ({
    url: node.data.props.url,
    height: node.data.props.height,
    id: node.id,
    title: node.data.props.title,
    hasError: node.data.props.hasError,
    errorType: node.data.props.errorType,
  }));

  const handleChange = (value: string) => {
    const validation = isValidUrl(value);
    setProp((props) => (props.url = value));
    setProp((props) => (props.errorType = validation[1]));
    setProp((props) => (props.hasError = !validation[0]));
    eventEmitter.emit('contentBuilderError', {
      [id]: !validation[0],
    });
  };

  return (
    <Box flexWrap="wrap" display="flex" gap="16px" marginBottom="20px">
      <Box flex="0 0 100%">
        <Input
          label={
            <span>
              {formatMessage(messages.iframeUrlLabel)}{' '}
              <IconTooltip
                icon="info3"
                content={formatMessage(messages.iframeUrlLabelTooltip)}
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
              {formatMessage(messages.iframeHeightLabel)}{' '}
              <IconTooltip
                icon="info3"
                content={formatMessage(messages.iframeHeightLabelTooltip)}
              />
            </span>
          }
          placeholder={formatMessage(messages.iframeHeightPlaceholder)}
          type="text"
          value={height}
          onChange={(value) => {
            setProp((props) => (props.height = value));
          }}
        />
      </Box>
      <Box flex="0 0 100%">
        <Input
          type="text"
          id="iframeTitleInput"
          onChange={(value) => {
            setProp((props) => (props.title = value));
          }}
          value={title}
          label={
            <span>
              {formatMessage(messages.iframeTitleLabel)}{' '}
              <IconTooltip
                icon="info3"
                content={formatMessage(messages.iframeTitleTooltip)}
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
    /https:\/\/.*\.typeform\.com\/to\/.*/,
    /https:\/\/widget\.surveymonkey\.com\/collect\/website\/js\/.*\.js/,
    /https:\/\/docs.google.com\/forms\/d\/e\/.*\/viewform\?embedded=true/,
    /https:\/\/surveys.enalyzer.com\/?\?pid=.*/,
    /https:\/\/www\.survey-xact\.dk\/LinkCollector\?key=.*/,
    /https:\/\/.*\.qualtrics\.com\/jfe\/form\/.*/,
    /https:\/\/www\.smartsurvey\.co\.uk\/.*/,
    /https:\/\/.*\.(microsoft|office)\.com\//,
    /https:\/\/.*www\.eventbrite\.com\/static\/widgets\/*/,
    /https:\/\/.*arcgis\.com/,
    /https:\/\/public\.tableau\.com.*/,
    /https:\/\/.*datastudio\.google\.com\/embed*/,
    /https:\/\/app\.powerbi\.com\//,
    /https:\/\/.*static\.ctctcdn\.com\/js*/,
    /https:\/\/.*instagram\.com/,
    /https:\/\/.*platform\.twitter\.com/,
    /https:\/\/name\.konveio\.com/,
    /https:\/\/.*youtu(be|.be)*/,
    /https:\/\/.*vimeo.com/,
    /https:\/\/.*dailymotion\.com\/embed\/video/,
    /https:\/\/.*media\.videotool\.dk\/.*vn=/,
    /https:\/\/.*dreambroker.com\/channel\/.*\/iframe/,
    /https:\/\/(.+)?(wistia\.com|wi\.st)\/.*/,
  ];

  invalidUrl = !urlWhiteList.some((rx) => rx.test(url));

  if (invalidUrl) {
    return [false, 'whitelist'];
  } else {
    return [true, 'whitelist'];
  }
};

export default Iframe;
