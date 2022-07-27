import React from 'react';
import { useFormContext } from 'react-hook-form';
import Error, { findErrorMessage, TFieldName } from 'components/UI/Error';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import { Text, Title } from '@citizenlab/cl2-component-library';

const RHFFeedback = ({ intl: { formatMessage } }: InjectedIntlProps) => {
  const {
    formState: { errors, isSubmitSuccessful, isSubmitted },
  } = useFormContext();

  const getAllErrorMessages = () => {
    const errorMessages: Array<{ field: string; message?: string }> = [];

    for (const field in errors) {
      const standardFieldError = errors[field]?.message;
      const apiError = errors[field]?.error;
      const multilocFieldFirstError = Object.values(
        errors[field] as Record<string, any>
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
        if (apiErrorMessage) {
          errorMessages.push({
            field,
            message: formatMessage(apiErrorMessage),
          });
        }
      } else if (multilocFieldFirstError) {
        errorMessages.push({
          field,
          message: multilocFieldFirstError,
        });
      }
    }

    return errorMessages;
  };
  console.log(errors);
  console.log(getAllErrorMessages());

  // Add a general success message
  // Add a general error message
  return (
    <>
      {isSubmitted ? (
        isSubmitSuccessful ? (
          <>success</>
        ) : (
          <Error>
            <Title>There was a problem!</Title>
            {getAllErrorMessages().map((error) => {
              return <Text key={error.field}>{error.message}</Text>;
            })}
          </Error>
        )
      ) : null}
    </>
  );
};

export default injectIntl(RHFFeedback);
