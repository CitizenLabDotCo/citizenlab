import React from 'react';

import { Text, Box } from '@citizenlab/cl2-component-library';

import Warning from 'components/UI/Warning';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from './messages';

import ImageCropper, { ImageCropperProps } from '.';

const Container = ({
  aspectRatioWidth,
  aspectRatioHeight,
  ...otherProps
}: ImageCropperProps) => {
  const { formatMessage } = useIntl();
  return (
    <Box>
      <ImageCropper
        {...{ aspectRatioWidth, aspectRatioHeight }}
        {...otherProps}
      />
      <Warning>
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
      </Warning>
    </Box>
  );
};

export default Container;
