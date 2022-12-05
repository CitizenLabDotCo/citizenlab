import React, { ReactNode } from 'react';
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';
import { Text } from '@citizenlab/cl2-component-library';
import Warning from 'components/UI/Warning';

interface Props {
  // make required
  showWarningMessage?: boolean;
  previewUrl: string;
  inputComponent: ReactNode;
}

const SlugInput = ({
  previewUrl,
  showWarningMessage,
  inputComponent,
}: Props) => {
  return (
    <>
      {inputComponent}
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
