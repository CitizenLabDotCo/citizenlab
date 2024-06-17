import React from 'react';

import {
  Text,
  Label,
  IconTooltip,
  Box,
} from '@citizenlab/cl2-component-library';
import useInstanceId from 'component-library/hooks/useInstanceId';

import Input from 'components/HookForm/Input';
import Warning from 'components/UI/Warning';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  showWarningMessage: boolean;
  previewUrl: string | null;
  slug?: string;
}

const SlugInput = ({ previewUrl, showWarningMessage, slug }: Props) => {
  const { formatMessage } = useIntl();
  const id = useInstanceId();

  return (
    <>
      <Box display="flex" alignItems="center">
        <Box mr="5px">
          <Label htmlFor={`slug-input-${id}`}>
            {formatMessage(messages.urlSlugLabel)}
          </Label>
        </Box>
        {/* Margin bottom is needed because of Label's default margin (which we need to remove) */}
        <Box mb="10px">
          <IconTooltip content={formatMessage(messages.slugTooltip)} />
        </Box>
      </Box>
      <Input id={`slug-input-${id}`} type="text" name="slug" value={slug} />
      {previewUrl && (
        <Text mb={showWarningMessage ? '16px' : '0'}>
          <i>
            <FormattedMessage {...messages.resultingURL} />
          </i>
          : {previewUrl}
        </Text>
      )}
      {showWarningMessage && (
        <Warning>
          <FormattedMessage {...messages.urlSlugBrokenLinkWarning} />
        </Warning>
      )}
    </>
  );
};

export default SlugInput;
