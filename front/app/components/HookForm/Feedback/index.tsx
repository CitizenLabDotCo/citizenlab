import React, { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import Error, { findErrorMessage, TFieldName } from 'components/UI/Error';
import { useIntl } from 'utils/cl-intl';
import { Text, Title, Box } from '@citizenlab/cl2-component-library';
import { scrollToElement } from 'utils/scroll';
import SuccessFeedback from './SuccessFeedback';
import messages from './messages';
import { get } from 'lodash-es';
import { RHFErrors } from 'typings';

type FeedbackProps = {
  successMessage?: string;
};

const Feedback = ({ successMessage }: FeedbackProps) => {
  const { formatMessage } = useIntl();
  const [successMessageIsVisible, setSuccessMessageIsVisible] = useState(true);
  const {
    formState: {
      errors: formContextErrors,
      isSubmitSuccessful,
      isSubmitted,
      submitCount,
    },
  } = useFormContext();

  useEffect(() => {
    if (submitCount > 0) {
      scrollToElement({ id: 'feedback' });
      setSuccessMessageIsVisible(true);
    }
  }, [submitCount]);

  const getAllErrorMessages = () => {
    const errorMessages: Array<{ field: string; message?: string }> = [];

    for (const field in formContextErrors) {
      const errors = get(formContextErrors, field) as RHFErrors;
      const standardFieldError = errors?.message;
      const apiError = errors?.error;
      const apiErrorValue = errors?.value;
      const multilocFieldFirstError = Object.values(
        errors as Record<string, any>
      )[0]?.message;

      if (standardFieldError) {
        errorMessages.push({
          field,
          message: String(standardFieldError),
        });
      } else if (apiError) {
        const apiErrorMessage = findErrorMessage(
          field as TFieldName,
          String(apiError)
        );

        errorMessages.push({
          field,
          message: apiErrorMessage
            ? formatMessage(
                apiErrorMessage,
                apiErrorValue ? { value: apiErrorValue } : undefined
              )
            : '',
        });
      } else if (multilocFieldFirstError) {
        errorMessages.push({
          field,
          message: multilocFieldFirstError,
        });
      }
    }

    return errorMessages;
  };

  const closeSuccessMessage = () => setSuccessMessageIsVisible(false);
  const successMessageIsShown = isSubmitSuccessful && successMessageIsVisible;
  const errorMessageIsShown =
    (getAllErrorMessages().length > 0 || formContextErrors.submissionError) &&
    !isSubmitSuccessful;

  return (
    <>
      {isSubmitted && (
        <Box id="feedback" data-testid="feedback" key={submitCount}>
          {successMessageIsShown && (
            <SuccessFeedback
              successMessage={
                successMessage || formatMessage(messages.successMessage)
              }
              closeSuccessMessage={closeSuccessMessage}
            />
          )}
          {errorMessageIsShown && (
            <Error
              marginBottom="12px"
              text={
                <>
                  {formContextErrors.submissionError ? (
                    <>
                      <Title color="red600" variant="h4">
                        {formatMessage(messages.submissionErrorTitle)}
                      </Title>
                      <Text
                        color="red600"
                        data-testid="feedbackSubmissionError"
                      >
                        {formatMessage(messages.submissionErrorText)}
                      </Text>
                    </>
                  ) : (
                    <Box data-testid="feedbackErrorMessage">
                      <Title color="red600" variant="h4" mt="0px" mb="0px">
                        {formatMessage(messages.errorTitle)}
                      </Title>
                      {getAllErrorMessages().map((error) => {
                        return error.message ? (
                          <Text
                            key={error.field}
                            onClick={() => scrollToElement({ id: error.field })}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                scrollToElement({ id: error.field });
                              }
                            }}
                            textDecoration="underline"
                            color="red600"
                            style={{ cursor: 'pointer' }}
                            role="link"
                            tabIndex={0}
                          >
                            {error.message}
                          </Text>
                        ) : null;
                      })}
                    </Box>
                  )}
                </>
              }
            />
          )}
        </Box>
      )}
    </>
  );
};

export default Feedback;
