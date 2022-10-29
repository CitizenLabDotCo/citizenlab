import { Button, ButtonProps } from '@citizenlab/cl2-component-library';
import React, { ReactNode } from 'react';

interface Props extends Partial<ButtonProps> {
  children: ReactNode;
  last: boolean;
}

const VerificationMethodButton = (props: Props) => {
  return (
    <Button
      icon="shield-check"
      buttonStyle="white"
      fullWidth={true}
      justify="left"
      whiteSpace="wrap"
      mb={props.last ? '0px' : '15px'}
      {...props}
    >
      {props.children}
    </Button>
  );
};

export default VerificationMethodButton;
