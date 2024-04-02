import React, { memo, ReactElement } from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import Button from 'components/UI/Button';
import Error from 'components/UI/Error';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';

interface Props {
  buttonText?: string | ReactElement;
  apiErrors: boolean;
  processing: boolean;
  onSubmit: () => Promise<void>;
}

export default memo(
  ({
    processing,
    buttonText = <FormattedMessage {...messages.submit} />,
    onSubmit,
    apiErrors,
  }: Props) => (
    <Box
      position="absolute"
      bottom="0px"
      width="100%"
      height="auto"
      background="#fff"
      border-top="solid 1px #ddd"
    >
      <Box maxWidth="700px" display="flex" padding="10px 16px" margin="auto">
        <Button
          className="e2e-submit-idea-form"
          processing={processing}
          text={buttonText}
          marginRight="10px"
          onClick={onSubmit}
          type="submit"
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
