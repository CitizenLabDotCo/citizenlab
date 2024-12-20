import React from 'react';

import { BoxProps, Dropdown } from '@citizenlab/cl2-component-library';

type Props = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  content: JSX.Element;
  trigger: JSX.Element;
} & BoxProps;
const Popup = ({ isOpen, content, trigger, setIsOpen, ...boxProps }: Props) => {
  return (
    <>
      {trigger}
      <Dropdown // Note: Using boxProps, this "dropdown" can actually open sideways/above/below the trigger.
        opened={isOpen}
        onClickOutside={() => setIsOpen(false)}
        content={content}
        {...boxProps}
      />
    </>
  );
};

export default Popup;
