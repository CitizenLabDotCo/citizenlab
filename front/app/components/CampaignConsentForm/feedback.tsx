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
  showFeedback: false | 'success' | 'error';
  errorMessage: string;
  closeFeedback: () => void;
};

const Feedback = ({
  successMessage,
  errorMessage,
  showFeedback,
  closeFeedback,
}: FeedbackProps) => {
  const [feedbackIsVisible, setFeedbackIsVisible] = useState(false);

  useEffect(() => {
    if (feedbackIsVisible) {
      scrollToElement({ id: 'feedback' });
    }
  }, [feedbackIsVisible]);

  useEffect(() => {
    setFeedbackIsVisible(!!showFeedback);
  }, [showFeedback]);

  const closeSuccessMessage = () => {
    closeFeedback();
    setFeedbackIsVisible(false);
  };

  return (
    <>
      {feedbackIsVisible && (
        <Box id="feedback" data-testid="feedback">
          {showFeedback === 'success' && (
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
          {showFeedback === 'error' && (
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
