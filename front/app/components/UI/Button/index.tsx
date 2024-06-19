import React from 'react';

import {
  Button,
  ButtonProps,
  ButtonContainerProps as ComponentLibraryButtonContainerProps,
  ButtonStyles,
} from '@citizenlab/cl2-component-library';
import { RouteType } from 'routes';

import Link from 'utils/cl-router/Link';

interface Props extends ButtonProps {
  linkTo?: RouteType | null;
  openLinkInNewTab?: boolean;
  scrollToTop?: boolean;
}

interface ButtonContainerProps extends ComponentLibraryButtonContainerProps {
  'data-testid'?: string;
  'data-cy'?: string;
}

const ButtonWrapper = ({
  linkTo,
  openLinkInNewTab,
  disabled,
  scrollToTop,
  ...rest
}: Props) => {
  const isExternalLink =
    linkTo && (linkTo.startsWith('http') || linkTo.startsWith('www'));

  const link =
    linkTo && !disabled
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
              scrollToTop={scrollToTop}
              {...rest}
            >
              {children}
            </Link>
          )
      : undefined;

  return <Button as={link} disabled={disabled} {...rest} />;
};

export default ButtonWrapper;

export type { Props, ButtonContainerProps, ButtonStyles, ButtonProps };
