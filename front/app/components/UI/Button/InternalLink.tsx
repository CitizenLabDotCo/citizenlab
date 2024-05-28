import React from 'react';

import { RouteType } from 'routes';

import Link from 'utils/cl-router/Link';

import { ButtonProps } from '.';

interface Props {
  linkTo?: RouteType | null;
  openLinkInNewTab?: boolean;
  scrollToTop?: boolean;
  children: ButtonProps['children'];
}

const InternalLink = ({
  linkTo,
  openLinkInNewTab,
  scrollToTop,
  children,
  ...rest
}: Props &
  Omit<ButtonProps, 'as' | 'size'> &
  React.HTMLAttributes<HTMLAnchorElement>) => {
  if (!linkTo) return null;

  return (
    <Link
      to={linkTo}
      target={openLinkInNewTab ? '_blank' : undefined}
      rel="noreferrer"
      scrollToTop={scrollToTop}
      {...rest}
    >
      {children}
    </Link>
  );
};

export default InternalLink;
