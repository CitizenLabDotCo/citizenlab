import React from 'react';
import messages from './messages';
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import {
  Text,
  Label,
  IconTooltip,
  Box,
} from '@citizenlab/cl2-component-library';
import Warning from 'components/UI/Warning';
import Input from 'components/HookForm/Input';

interface Props {
  showWarningMessage: boolean;
  previewUrl: string;
  slug: string;
}

const SlugInput = ({ previewUrl, showWarningMessage, slug }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <>
      <Box display="flex" alignItems="center">
        <Box mr="5px">
          <Label htmlFor="slug-input">
            {formatMessage(messages.urlSlugLabel)}
          </Label>
        </Box>
        {/* Margin bottom is needed because of Label's default margin (which we need to remove) */}
        <Box mb="10px">
          <IconTooltip content={formatMessage(messages.slugTooltip)} />
        </Box>
      </Box>
      <Input id="slug-input" type="text" name="slug" value={slug} />
      <Text mb={showWarningMessage ? '16px' : '0'}>
        <i>
          <FormattedMessage {...messages.resultingURL} />
        </i>
        : {previewUrl}
      </Text>
      {showWarningMessage && (
        <Warning>
          <FormattedMessage {...messages.urlSlugBrokenLinkWarning} />
        </Warning>
      )}
    </>
  );
};

export default SlugInput;
