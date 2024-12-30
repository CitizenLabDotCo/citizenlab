import React from 'react';

import { Button, fontSizes } from '@citizenlab/cl2-component-library';

interface Props {
  children: React.ReactNode;
  onClick: () => void;
}

const DeleteButton = ({ children, onClick }: Props) => {
  return (
    <Button
      buttonStyle="delete"
      onClick={onClick}
      icon="delete"
      size="s"
      p="4px 8px"
      fontSize={`${fontSizes.s}px`}
    >
      {children}
    </Button>
  );
};

export default DeleteButton;
