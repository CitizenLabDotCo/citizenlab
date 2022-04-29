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
}

const Iframe = ({ url, height, hasError }: Props) => {
  return (
    <Box minHeight="26px">
      {!hasError && url && <iframe src={url} width="100%" height={height} />}
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
  } = useNode((node) => ({
    url: node.data.props.url,
    height: node.data.props.height,
    id: node.id,
    hasError: node.data.props.hasError,
  }));

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
            setProp((props) => (props.url = value));
            setProp((props) => (props.hasError = !validateUrl(value)));
            eventEmitter.emit('contentBuilderError', {
              [id]: !validateUrl(value),
            });
          }}
        />
        {hasError && <Error marginTop="4px" text={'Error Message'} />}
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
const validateUrl = (url: string) => {
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
  ];

  let found: RegExpMatchArray | null = null;
  let i = 0;

  while (found === null && i < urlWhiteList.length) {
    found = url.match(urlWhiteList[i]);
    i++;
  }

  if (found !== null) {
    return true;
  } else {
    return false;
  }
};

export default Iframe;
