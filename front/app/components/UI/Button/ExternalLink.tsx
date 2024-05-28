import React from 'react';

import { RouteType } from 'routes';

import { ButtonProps } from '.';

interface Props {
  linkTo?: RouteType | null;
  openLinkInNewTab?: boolean;
  children: ButtonProps['children'];
}

const ExternalLink = ({
  linkTo,
  openLinkInNewTab,
  children,
  ...rest
}: Props & ButtonProps & React.HTMLAttributes<HTMLAnchorElement>) => {
  if (!linkTo) return null;

  return (
    <a
      href={linkTo}
      target={openLinkInNewTab ? '_blank' : undefined}
      rel="noreferrer"
      {...rest}
    >
      {children}
    </a>
  );
};

export default ExternalLink;
