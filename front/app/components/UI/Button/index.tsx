import React from 'react';

import {
  Button,
  ButtonProps,
  ButtonContainerProps as ComponentLibraryButtonContainerProps,
  ButtonStyles,
} from '@citizenlab/cl2-component-library';
import { RouteType } from 'routes';

import ExternalLink from './ExternalLink';
import InternalLink from './InternalLink';

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
    linkTo?.startsWith('http') || linkTo?.startsWith('www');

  const link =
    linkTo && !disabled
      ? isExternalLink
        ? ({
            children,
            ...rest
          }: ButtonProps & React.HTMLAttributes<HTMLAnchorElement>) => (
            <ExternalLink
              linkTo={linkTo}
              openLinkInNewTab={openLinkInNewTab}
              {...rest}
            >
              {children}
            </ExternalLink>
          )
        : ({
            children,
            ...rest
          }: Omit<ButtonProps, 'as' | 'size'> &
            React.HTMLAttributes<HTMLAnchorElement>) => (
            <InternalLink
              linkTo={linkTo}
              openLinkInNewTab={openLinkInNewTab}
              scrollToTop={scrollToTop}
              {...rest}
            >
              {children}
            </InternalLink>
          )
      : undefined;

  return <Button as={link} disabled={disabled} {...rest} />;
};

export default ButtonWrapper;

export type { Props, ButtonContainerProps, ButtonStyles, ButtonProps };
