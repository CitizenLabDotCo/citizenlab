import React, { useEffect, useState } from 'react';

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
  height: string;
}

const CraftIframe = ({ url, height }: Props) => {
  return (
    <Box minHeight="26px">
      <iframe src={url} width="100%" height={height} />
    </Box>
  );
};

const CraftIframeSettings = injectIntl(({ intl: { formatMessage } }) => {
  const [contentBuilderErrors, setContentBuilderErrors] = useState({});

  useEffect(() => {
    const subscription = eventEmitter
      .observeEvent('contentBuilderErrors')
      .subscribe(({ eventValue }) =>
        setContentBuilderErrors(eventValue as Record<string, boolean>)
      );
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const {
    actions: { setProp },
    url,
    height,
    id,
  } = useNode((node) => ({
    url: node.data.props.url,
    height: node.data.props.height,
    id: node.id,
  }));

  console.log(contentBuilderErrors);

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
            eventEmitter.emit('contentBuilderErrors', {
              ...contentBuilderErrors,
              [id]: !validateUrl(value),
            });
          }}
        />
        {contentBuilderErrors[id] && (
          <Error id="url-error" text={'Error Message'} />
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
    </Box>
  );
});

CraftIframe.craft = {
  props: {
    url: '',
    height: '',
  },
  related: {
    settings: CraftIframeSettings,
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

export default CraftIframe;
