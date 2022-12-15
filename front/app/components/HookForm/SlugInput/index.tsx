import React from 'react';
import messages from './messages';
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { Text } from '@citizenlab/cl2-component-library';
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
      <Input
        label={formatMessage(messages.urlSlugLabel)}
        labelTooltipText={formatMessage(messages.slugTooltip)}
        type="text"
        name="slug"
        value={slug}
      />
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
