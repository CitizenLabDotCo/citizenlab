import React from 'react';
import { Text, Box } from '@citizenlab/cl2-component-library';
import Warning from 'components/UI/Warning';
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import ImageCropper, { ImageCropperProps } from '.';
import messages from './messages';

const Container = ({ aspect, ...otherProps }: ImageCropperProps) => {
  const { formatMessage } = useIntl();
  return (
    <Box>
      <ImageCropper aspect={aspect} {...otherProps} />
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
              aspect,
            }}
          />
        </Text>
      </Warning>
    </Box>
  );
};

export default Container;
