import React from 'react';
import Input from 'components/HookForm/Input';
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';
import { Text } from '@citizenlab/cl2-component-library';
import Warning from 'components/UI/Warning';

interface Props {
  // make required
  showWarningMessage?: boolean;
  previewUrl: string;
  // You don't need to specify this in a hook form
  onChange?: (slug: string) => void;
  currentSlug?: string;
}

const SlugInput = ({
  previewUrl,
  showWarningMessage,
  onChange,
  currentSlug,
}: Props) => {
  return (
    <>
      <Input
        label={<FormattedMessage {...messages.pageSlug} />}
        labelTooltipText={<FormattedMessage {...messages.slugTooltip} />}
        id="slug"
        name="slug"
        type="text"
        onChange={onChange}
        value={currentSlug}
      />
      <Text mb={showWarningMessage ? '16px' : '0'}>
        <i>
          <FormattedMessage {...messages.resultingPageURL} />
        </i>
        : {previewUrl}
      </Text>
      {showWarningMessage && (
        <Warning>
          <FormattedMessage {...messages.brokenURLWarning} />
        </Warning>
      )}
    </>
  );
};

export default SlugInput;
