import React, { memo, ReactElement } from 'react';

// components
import Button from 'components/UI/Button';
import Error from 'components/UI/Error';

// i18n
import { FormattedMessage } from 'utils/cl-intl';

// style
import { Box } from 'cl2-component-library';
import messages from './messages';

interface Props {
  buttonText?: string | ReactElement;
  apiErrors: boolean;
  valid: boolean;
  processing: boolean;
  onSubmit: () => Promise<void>;
}

export default memo(
  ({
    processing,
    buttonText = <FormattedMessage {...messages.submit} />,
    onSubmit,
    apiErrors,
    valid,
  }: Props) => (
    <Box width="100%" background="#fff" borderTop="solid 1px #ddd">
      <Box
        maxWidth="740px"
        display="flex"
        alignItems="center"
        padding="10px 30px"
        margin="auto"
      >
        <Button
          className="e2e-submit-idea-form"
          processing={processing}
          text={buttonText}
          marginRight="10px"
          onClick={onSubmit}
          type="submit"
          disabled={!valid}
        />
        {apiErrors && (
          <Error
            text={<FormattedMessage {...messages.submitApiError} />}
            marginTop="0px"
            showBackground={false}
            showIcon={true}
          />
        )}
      </Box>
    </Box>
  )
);
