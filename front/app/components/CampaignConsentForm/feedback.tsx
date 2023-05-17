import React, { useEffect } from 'react';
import Error from 'components/UI/Error';
import { Text, Box } from '@citizenlab/cl2-component-library';
import { scrollToElement } from 'utils/scroll';
import SuccessFeedback from 'components/HookForm/Feedback/SuccessFeedback';

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
  useEffect(() => {
    if (showFeedback) {
      scrollToElement({ id: 'email_campaigns_feedback' });
    }
  }, [showFeedback]);

  return (
    <>
      {showFeedback && (
        <Box id="email_campaigns_feedback" data-testid="feedback">
          {showFeedback === 'success' && (
            <SuccessFeedback
              successMessage={successMessage}
              closeSuccessMessage={closeFeedback}
            />
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
