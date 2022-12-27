import React from 'react';
import { Text, Box } from '@citizenlab/cl2-component-library';
import Warning from 'components/UI/Warning';
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import ImageCropper, { ImageCropperProps } from './';
import messages from './messages';

const ImageCropperContainer = ({
  image,
  onComplete,
  aspect,
}: ImageCropperProps) => {
  const { formatMessage } = useIntl();
  return (
    <Box>
      <ImageCropper image={image} onComplete={onComplete} aspect={aspect} />
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
              aspect: aspect,
            }}
          />
        </Text>
      </Warning>
    </Box>
  );
};

export default ImageCropperContainer;
