import React, { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { findErrorMessage, TFieldName } from 'components/UI/Error';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import { Text, Title, Box, colors } from '@citizenlab/cl2-component-library';
import { scrollToElement } from 'utils/scroll';

const RHFFeedback = ({ intl: { formatMessage } }: InjectedIntlProps) => {
  const {
    formState: { errors, isSubmitSuccessful, isSubmitted, submitCount },
  } = useFormContext();

  useEffect(() => {
    if (submitCount > 0) {
      scrollToElement({ id: 'rhfFeedback' });
    }
  }, [submitCount]);

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

  return (
    <Box id="rhfFeedback">
      {isSubmitted ? (
        isSubmitSuccessful ? (
          <Box
            bgColor={colors.clGreenSuccessBackground}
            borderRadius="3px"
            px="12px"
            py="4px"
            mb="12px"
          >
            <Title color="clGreenSuccess" variant="h4">
              Form is submitted successfully!
            </Title>
          </Box>
        ) : (
          <Box
            bgColor={colors.clRedErrorBackground}
            borderRadius="3px"
            px="12px"
            py="4px"
            mb="12px"
          >
            <Title color="clRed" variant="h4">
              There is a problem!
            </Title>
            {getAllErrorMessages().map((error) => {
              return (
                <Text
                  key={error.field}
                  onClick={() => scrollToElement({ id: error.field })}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      scrollToElement({ id: error.field });
                    }
                  }}
                  textDecoration="underline"
                  color="clRed"
                  style={{ cursor: 'pointer' }}
                  role="link"
                  tabIndex={0}
                >
                  {error.message}
                </Text>
              );
            })}
          </Box>
        )
      ) : null}
    </Box>
  );
};

export default injectIntl(RHFFeedback);
