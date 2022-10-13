import { Box, Button, ButtonProps } from '@citizenlab/cl2-component-library';
import React, { ReactNode } from 'react';

interface Props extends Partial<ButtonProps> {
  children: ReactNode;
  last: boolean;
}

const VerificationMethodButton = (props: Props) => {
  return (
    <Box mb={props.last ? '0px' : '15px'}>
      <Button
        icon="shield-check"
        iconSize="22px"
        buttonStyle="white"
        fullWidth={true}
        justify="left"
        whiteSpace="wrap"
        {...props}
      >
        {props.children}
      </Button>
    </Box>
  );
};

export default VerificationMethodButton;
