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
            <FormattedMessage
              {...messages.info}
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
                aspect: `${aspectRatioWidth}:${aspectRatioHeight}`,
              }}
            />
          </Text>

          {show3x1MobileCropLines && (
            <Text fontStyle="italic">
              <FormattedMessage {...messages.mobileCropExplanation} />
            </Text>
          )}
        </Box>
      </Warning>
    </Box>
  );
};

export default Container;
