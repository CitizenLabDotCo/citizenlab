import React, { ReactElement } from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';

import ButtonWithLink from 'components/UI/ButtonWithLink';
import Error from 'components/UI/Error';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';

interface Props {
  buttonText?: string | ReactElement;
  apiErrors: boolean;
  processing: boolean;
  onSubmit: () => Promise<void>;
}

const ButtonBar = ({
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
    background={colors.white}
    border-top="solid 1px #ddd"
  >
    <Box maxWidth="700px" display="flex" padding="10px 16px" margin="auto">
      <ButtonWithLink
        className="e2e-submit-idea-form"
        processing={processing}
        disabled={processing}
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
);

export default ButtonBar;
