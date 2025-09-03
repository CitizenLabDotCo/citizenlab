import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

interface Props {
  formId: string | undefined;
  children: React.ReactNode;
}

const FormWrapper = ({ formId, children }: Props) => {
  return (
    <Box
      id={formId}
      as="form"
      display="flex"
      flexDirection="column"
      // This is necessary for the form to grow with the content and still be scrollable
      height="100%"
      w="100%"
    >
      {children}
    </Box>
  );
};

export default FormWrapper;
