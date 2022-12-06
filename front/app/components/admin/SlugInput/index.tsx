import React from 'react';
import slugInputMessages from 'components/HookForm/SlugInput/messages';
import { useIntl, FormattedMessage } from 'utils/cl-intl';
import { Text, Input } from '@citizenlab/cl2-component-library';
import Warning from 'components/UI/Warning';

interface Props {
  showWarningMessage: boolean;
  previewUrl: string;
  onChange: (slug: string) => void;
  slug: string;
}

const SlugInput = ({
  previewUrl,
  showWarningMessage,
  onChange,
  slug,
}: Props) => {
  const { formatMessage } = useIntl();
  return (
    <>
      <Input
        label={formatMessage(slugInputMessages.urlSlugLabel)}
        labelTooltipText={formatMessage(slugInputMessages.slugTooltip)}
        type="text"
        onChange={onChange}
        value={slug}
      />
      <Text mb={showWarningMessage ? '16px' : '0'}>
        <i>
          <FormattedMessage {...slugInputMessages.resultingURL} />
        </i>
        : {previewUrl}
      </Text>
      {showWarningMessage && (
        <Warning>
          <FormattedMessage {...slugInputMessages.urlSlugBrokenLinkWarning} />
        </Warning>
      )}
    </>
  );
};

export default SlugInput;
