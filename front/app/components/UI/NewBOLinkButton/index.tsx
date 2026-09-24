import React, { forwardRef } from 'react';

import { newBOButtonProps } from '@citizenlab/cl2-component-library';

import ButtonWithLink, { Props } from 'components/UI/ButtonWithLink';

const NewBOLinkButton = forwardRef<HTMLButtonElement, Props>(
  ({ buttonStyle, ...props }, ref) => (
    <ButtonWithLink {...newBOButtonProps(buttonStyle)} {...props} ref={ref} />
  )
);

export default NewBOLinkButton;
