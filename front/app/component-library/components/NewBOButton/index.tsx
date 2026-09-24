import React, { forwardRef } from 'react';

import { colors, fontSizes, newBO } from '../../utils/styleUtils';
import Button, { ButtonStyles, Props as ButtonProps } from '../Button';

// 'status' has no equivalent in Button, so it rides on the neutral 'text' base.
export type NewBOButtonStyle = ButtonStyles | 'status';

export type NewBOButtonProps = Omit<ButtonProps, 'buttonStyle'> & {
  buttonStyle?: NewBOButtonStyle;
};

const GEOMETRY = {
  height: '36px',
  padding: '0 16px',
  borderRadius: newBO.borderRadius,
  fontSize: `${fontSizes.s}px`,
  fontWeight: '500',
  lineHeight: '20px',
  iconSize: '16px',
};

const SECONDARY = {
  bgColor: colors.white,
  bgHoverColor: colors.grey50,
  borderColor: colors.grey300,
  borderHoverColor: colors.coolGrey500,
  textColor: newBO.colors.textHeadingStrong,
  textHoverColor: newBO.colors.textHeadingStrong,
  iconColor: newBO.colors.textHeadingStrong,
  iconHoverColor: newBO.colors.textHeadingStrong,
};

const STATUS = {
  bgColor: newBO.colors.statusFill,
  bgHoverColor: newBO.colors.statusFillHover,
  textColor: colors.green700,
  textHoverColor: colors.green700,
  iconColor: colors.green700,
  iconHoverColor: colors.green700,
};

export const newBOButtonProps = (buttonStyle: NewBOButtonStyle | undefined) => {
  const outlined = buttonStyle === 'secondary-outlined';
  const status = buttonStyle === 'status';

  return {
    ...GEOMETRY,
    buttonStyle: status ? ('text' as const) : buttonStyle,
    borderThickness: outlined ? '1px' : '0',
    ...(outlined ? SECONDARY : {}),
    ...(status ? STATUS : {}),
  };
};

const NewBOButton = forwardRef<HTMLButtonElement, NewBOButtonProps>(
  ({ buttonStyle, ...props }, ref) => (
    <Button {...newBOButtonProps(buttonStyle)} {...props} ref={ref} />
  )
);

export default NewBOButton;
