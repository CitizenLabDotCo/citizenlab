import React, { forwardRef } from 'react';

import {
  Button,
  ButtonProps,
  ButtonStyles,
} from '@citizenlab/cl2-component-library';

import Link from 'utils/cl-router/Link';

import type { LinkProps } from '@tanstack/react-router';

interface Props extends ButtonProps {
  // Preferred: typed-route props mirroring cl-router/Link's shape.
  to?: LinkProps['to'];
  params?: Record<string, string>;
  search?: Record<string, unknown>;
  // Legacy/external/admin-supplied URL escape hatch. Prefer `to` for known
  // internal routes — this stays for arbitrary admin-configured URLs.
  linkTo?: string | null;
  openLinkInNewTab?: boolean;
  scrollToTop?: boolean;
}

type Ref = HTMLButtonElement;

const ButtonWithLink = forwardRef<Ref, Props>(
  (
    {
      to,
      params,
      search,
      linkTo,
      openLinkInNewTab,
      disabled,
      scrollToTop,
      ...rest
    },
    ref
  ) => {
    const isExternalLink =
      linkTo &&
      (linkTo.startsWith('http') ||
        linkTo.startsWith('www') ||
        linkTo.startsWith('mailto'));

    const link = disabled
      ? undefined
      : to
      ? ({
          children,
          ...rest
        }: Omit<ButtonProps, 'as' | 'size'> &
          React.HTMLAttributes<HTMLAnchorElement>) => (
          <Link
            to={to}
            params={params as Parameters<typeof Link>[0]['params']}
            search={search as Parameters<typeof Link>[0]['search']}
            target={openLinkInNewTab ? '_blank' : undefined}
            rel="noreferrer"
            scrollToTop={scrollToTop}
            {...rest}
          >
            {children}
          </Link>
        )
      : linkTo
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
              to={linkTo as LinkProps['to']}
              target={openLinkInNewTab ? '_blank' : undefined}
              rel="noreferrer"
              scrollToTop={scrollToTop}
              {...rest}
            >
              {children}
            </Link>
          )
      : undefined;

    return <Button as={link} disabled={disabled} {...rest} ref={ref} />;
  }
);

export default ButtonWithLink;

export type { Props, ButtonStyles, ButtonProps };
