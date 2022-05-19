import React from 'react';
import { isNilOrError } from 'utils/helperUtils';
import useLocale from 'hooks/useLocale';
import {
  Button,
  ButtonProps,
  ButtonContainerProps as ComponentLibraryButtonContainerProps,
  ButtonStyles,
} from '@citizenlab/cl2-component-library';

import Link from 'utils/cl-router/Link';
interface Props extends ButtonProps {
  linkTo?: string;
  openLinkInNewTab?: boolean;
}

interface ButtonContainerProps extends ComponentLibraryButtonContainerProps {
  'data-testid'?: string;
}

const ButtonWrapper = ({ linkTo, openLinkInNewTab, ...rest }: Props) => {
  const locale = useLocale();
  const isExternalLink =
    linkTo && (linkTo.startsWith('http') || linkTo.startsWith('www'));

  const link = linkTo
    ? isExternalLink
      ? ({
          children,
          ...rest
        }: ButtonProps & React.HTMLAttributes<HTMLAnchorElement>) => (
          <a
            href={linkTo}
            target={openLinkInNewTab ? '_blank' : undefined}
            rel="noreferrer"
            {...rest}
          >
            {children}
          </a>
        )
      : ({
          children,
          ...rest
        }: Omit<ButtonProps, 'as' | 'size'> &
          React.HTMLAttributes<HTMLAnchorElement>) => (
          <Link
            to={linkTo}
            target={openLinkInNewTab ? '_blank' : undefined}
            rel="noreferrer"
            {...rest}
          >
            {children}
          </Link>
        )
    : undefined;

  if (!isNilOrError(locale)) {
    return <Button {...rest} as={link} />;
  }

  return null;
};

export default ButtonWrapper;

export { Props, ButtonContainerProps, ButtonStyles, ButtonProps };
