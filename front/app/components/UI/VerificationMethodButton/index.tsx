import React, { ReactNode } from 'react';

import {
  Button,
  ButtonProps,
  IconNames,
} from '@citizenlab/cl2-component-library';

interface Props extends Partial<ButtonProps> {
  children: ReactNode;
  last: boolean;
  icon?: IconNames;
}

const VerificationMethodButton = (props: Props) => {
  return (
    <Button
      icon={props.icon ? props.icon : 'shield-check'}
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
