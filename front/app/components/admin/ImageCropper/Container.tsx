import React from 'react';

import { Text, Box } from '@citizenlab/cl2-component-library';

import Warning from 'components/UI/Warning';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from './messages';

import ImageCropper, { ImageCropperProps } from '.';

const Container = ({
  aspectRatioWidth,
  aspectRatioHeight,
  show3x1MobileCropLines = false,
  ...otherProps
}: ImageCropperProps) => {
  const { formatMessage } = useIntl();
  return (
    <Box>
      <ImageCropper
        {...{ aspectRatioWidth, aspectRatioHeight, show3x1MobileCropLines }}
        {...otherProps}
      />
      <Warning>
        <Box>
          <Text>
            <FormattedMessage {...messages.cropSentenceOne} />
          </Text>
          <ul>
            <li>
              <Text>
                <FormattedMessage
                  {...messages.cropSentenceTwo}
                  values={{
                    aspect: `${aspectRatioWidth}:${aspectRatioHeight}`,
                  }}
                />
              </Text>
            </li>
            {show3x1MobileCropLines && (
              <li>
                <Text>
                  <FormattedMessage {...messages.cropSentenceMobileRatio} />
                </Text>
              </li>
            )}
          </ul>
          {show3x1MobileCropLines && (
            <Text>
              <FormattedMessage {...messages.cropSentenceMobileCrop} />
            </Text>
          )}
          <Text>
            <FormattedMessage
              {...messages.cropFinalSentence}
              values={{
                link: (
                  <a
                    href={formatMessage(messages.imageSupportPageURL2)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <FormattedMessage {...messages.infoLinkText} />
                  </a>
                ),
              }}
            />
          </Text>
        </Box>
      </Warning>
    </Box>
  );
};

export default Container;
