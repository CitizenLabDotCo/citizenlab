import React, { memo, ReactElement } from 'react';

// components
import Button from 'components/UI/Button';
import Error from 'components/UI/Error';
import ButtonBar from 'components/ButtonBar';

// i18n
import { FormattedMessage } from 'utils/cl-intl';

// style
import { Box } from 'cl2-component-library';
import messages from './messages';

interface Props {
  formId?: string;
  buttonText?: string | ReactElement;
  submitError: boolean;
  processing: boolean;
  onSubmit: () => Promise<void>;
}

const IdeasEditButtonBar = memo(
  ({
    formId = '',
    processing,
    submitError,
    buttonText = <FormattedMessage {...messages.submit} />,
    onSubmit,
  }: Props) => {
    const getSubmitErrorMessage = () => {
      if (submitError) {
        return <FormattedMessage {...messages.submitApiError} />;
      }

      return null;
    };

    const submitErrorMessage = getSubmitErrorMessage();

    return (
      // TODO evaluate ButtonBar component usage, refactor and move to library
      <ButtonBar>
        <Box
          width="100%"
          maxWidth="700px"
          display="flex"
          alignItems="center"
          padding="0 30px"
        >
          <Button
            form={formId}
            className="e2e-submit-idea-form"
            processing={processing}
            text={buttonText}
            marginRight="10px"
            onClick={onSubmit}
            type="submit"
          />
          {submitErrorMessage && (
            // TODO refactor Error Component and move to library
            <Error
              text={submitErrorMessage}
              marginTop="0px"
              showBackground={false}
              showIcon={true}
              // flex="1"
            />
          )}
        </Box>
      </ButtonBar>
    );
  }
);

export default IdeasEditButtonBar;
