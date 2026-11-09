import React, { useId } from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

interface Props {
  label: string;
  children: React.ReactNode;
}

const FormSection = ({ label, children }: Props) => {
  const labelId = useId();

  return (
    <Box
      role="group"
      aria-labelledby={labelId}
      display="flex"
      flexDirection="column"
      gap="12px"
    >
      <Text
        id={labelId}
        variant="boMicro"
        color="coolGrey500"
        lineHeight="1.5"
        m="0px"
      >
        {label}
      </Text>
      {children}
    </Box>
  );
};

export default FormSection;
