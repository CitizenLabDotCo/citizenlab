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
            <li>
              <Text>
                <FormattedMessage {...messages.cropSentenceThree} />
              </Text>
            </li>
          </ul>
          <Text>
            <FormattedMessage {...messages.cropSentenceFour} />
          </Text>
          <Text>
            <FormattedMessage
              {...messages.cropSentenceFive}
              values={{
                link: (
                  <a
                    href={formatMessage(messages.imageSupportPageURL)}
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
