import React from 'react';

import { Text, Box } from '@citizenlab/cl2-component-library';

import Warning from 'components/UI/Warning';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from './messages';

import ImageCropper, { ImageCropperProps } from '.';

const Container = ({
  aspectRatioWidth,
  aspectRatioHeight,
  showMobileCropLines = false,
  ...otherProps
}: ImageCropperProps) => {
  const { formatMessage } = useIntl();
  return (
    <Box>
      <ImageCropper
        {...{ aspectRatioWidth, aspectRatioHeight, showMobileCropLines }}
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

          {showMobileCropLines && (
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
