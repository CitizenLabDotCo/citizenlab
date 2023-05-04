import React, { useEffect, useState } from 'react';
import Error from 'components/UI/Error';
import {
  Text,
  Title,
  Box,
  colors,
  Icon,
} from '@citizenlab/cl2-component-library';
import { scrollToElement } from 'utils/scroll';
import CloseIconButton from 'components/UI/CloseIconButton';

type FeedbackProps = {
  successMessage: string;
  showSuccess: boolean;
  showError: boolean;
  errorMessage: string;
  closeFeedback: () => void;
};

const Feedback = ({
  successMessage,
  showSuccess,
  showError,
  errorMessage,
  closeFeedback,
}: FeedbackProps) => {
  const [feedbackIsVisible, setFeedbackIsVisible] = useState(
    showSuccess || showError
  );

  useEffect(() => {
    console.log('feedbackIsVisible', feedbackIsVisible);
    if (feedbackIsVisible) {
      scrollToElement({ id: 'feedback' });
    }
  }, [feedbackIsVisible]);

  useEffect(() => {
    console.log('feedbackIsVisible', feedbackIsVisible);
    setFeedbackIsVisible(showSuccess || showError);
  }, [showSuccess, showError]);

  const closeSuccessMessage = () => {
    closeFeedback();
    setFeedbackIsVisible(false);
  };

  console.log(
    successMessage,
    showSuccess,
    showError,
    errorMessage,
    feedbackIsVisible
  );
  return (
    <>
      {feedbackIsVisible && (
        <Box id="feedback" data-testid="feedback">
          {showSuccess && (
            <Box
              bgColor={colors.successLight}
              borderRadius="3px"
              px="12px"
              py="4px"
              mb="24px"
              role="alert"
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              data-testid="feedbackSuccessMessage"
            >
              <Box display="flex" gap="16px" alignItems="center">
                <Icon
                  name="check-circle"
                  fill={colors.success}
                  width="24px"
                  height="24px"
                />
                <Title color="success" variant="h4" as="h3">
                  {successMessage}
                </Title>
              </Box>
              <CloseIconButton onClick={closeSuccessMessage} />
            </Box>
          )}
          {showError && (
            <Error
              marginBottom="12px"
              text={
                <Text color="red600" m="0">
                  {errorMessage}
                </Text>
              }
            />
          )}
        </Box>
      )}
    </>
  );
};

export default Feedback;
