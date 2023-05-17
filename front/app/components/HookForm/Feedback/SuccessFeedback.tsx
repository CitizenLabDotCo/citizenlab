import React from 'react';
import { Title, Box, colors, Icon } from '@citizenlab/cl2-component-library';
import CloseIconButton from 'components/UI/CloseIconButton';

type SuccessFeedbackProps = {
  successMessage: string;
  closeSuccessMessage: () => void;
};

const SuccessFeedback = ({
  successMessage,
  closeSuccessMessage,
}: SuccessFeedbackProps) => (
  <Box
    bgColor={colors.successLight}
    borderRadius="3px"
    px="12px"
    py="4px"
    mb="12px"
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
);

export default SuccessFeedback;
