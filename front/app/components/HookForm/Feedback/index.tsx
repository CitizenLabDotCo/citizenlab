import React, { useEffect, useState } from 'react';

import { Text, Title, Box } from '@citizenlab/cl2-component-library';
import { get } from 'lodash-es';
import { useFormContext } from 'react-hook-form';
import { CLError, RHFErrors } from 'typings';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

import Error, {
  findErrorMessage,
  getApiErrorValues,
  TFieldName,
} from 'components/UI/Error';

import { useIntl } from 'utils/cl-intl';
import { scrollToElement } from 'utils/scroll';

import messages from './messages';
import SuccessFeedback from './SuccessFeedback';

type FeedbackProps = {
  successMessage?: string;
  onlyShowErrors?: boolean;
};

const Feedback = ({ successMessage, onlyShowErrors }: FeedbackProps) => {
  const { formatMessage } = useIntl();
  const [successMessageIsVisible, setSuccessMessageIsVisible] = useState(true);
  const { data: appConfiguration } = useAppConfiguration();

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
    const errorMessages: Array<{
      field: string;
      message?: string | React.ReactNode;
    }> = [];

    for (const field in formContextErrors) {
      const errors = get(formContextErrors, field) as RHFErrors;
      const standardFieldError = errors?.message;
      const apiError = errors?.error;
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

        const values = getApiErrorValues(errors as CLError, appConfiguration);
        errorMessages.push({
          field,
          message: apiErrorMessage
            ? formatMessage(apiErrorMessage, values)
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
  const errorMessageIsShown =
    (getAllErrorMessages().length > 0 || formContextErrors.submissionError) &&
    !isSubmitSuccessful;
  const successMessageIsShown = isSubmitSuccessful && successMessageIsVisible;

  return (
    <>
      {isSubmitted && (
        <Box id="feedback" data-testid="feedback" key={submitCount}>
          {successMessageIsShown && onlyShowErrors !== true && (
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
