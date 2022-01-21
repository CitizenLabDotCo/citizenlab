import React, { memo } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import useLocale from 'hooks/useLocale';
import {
  Button,
  ButtonProps,
  ButtonContainerProps as ComponentLibraryButtonContainerProps,
  ButtonStyles as ComponentLibraryButtonStyles,
} from '@citizenlab/cl2-component-library';

interface Props extends Omit<ButtonProps, 'locale'> {}

interface ButtonContainerProps extends ComponentLibraryButtonContainerProps {}

type ButtonStyles = ComponentLibraryButtonStyles;

const ButtonWrapper = memo<Props>((props) => {
  const locale = useLocale();

  if (!isNilOrError(locale)) {
    console.log(props);
    return <Button {...props} locale={locale} />;
  }

  return null;
});

export default ButtonWrapper;

export { Props, ButtonContainerProps, ButtonStyles };
