import React from 'react';
import Input from 'components/HookForm/Input';
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';
import { Text } from '@citizenlab/cl2-component-library';
import Warning from 'components/UI/Warning';

interface Props {
  showWarningMessage?: boolean;
  previewUrl: string;
}

const SlugInput = ({ previewUrl, showWarningMessage }: Props) => {
  return (
    <>
      <Input
        label={<FormattedMessage {...messages.pageSlug} />}
        labelTooltipText={<FormattedMessage {...messages.slugTooltip} />}
        id="slug"
        name="slug"
        type="text"
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
