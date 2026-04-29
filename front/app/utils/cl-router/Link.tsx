import React from 'react';

import {
  createLink,
  type CreateLinkProps,
  type LinkComponent,
} from '@tanstack/react-router';

import useLocale from 'hooks/useLocale';
import { scrollToTop as scrollTop } from 'utils/scroll';

interface ExtraProps {
  scrollToTop?: boolean;
  onlyActiveOnIndex?: boolean;
}

const Inner = React.forwardRef<
  HTMLAnchorElement,
  CreateLinkProps & ExtraProps
>(({ scrollToTop, onlyActiveOnIndex: _i, onClick, ...rest }, ref) => (
  <a
    ref={ref}
    {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
    onClick={(e) => {
      onClick?.(e as any);
      if (scrollToTop) scrollTop('link');
    }}
  />
));
Inner.displayName = 'ClRouterLinkInner';

const TypedLink: LinkComponent<typeof Inner> = createLink(Inner);

// Wrapper that auto-injects the current locale into `params` so callers can
// write typed paths like `/$locale/admin/projects/$projectId` without ever
// passing `locale` themselves. A user-supplied `params.locale` wins (escape
// hatch for cross-locale links).
const Link: LinkComponent<typeof Inner> = (props) => {
  const locale = useLocale();
  const { params, onlyActiveOnIndex, activeOptions, ...rest } = props as {
    params?: unknown;
    onlyActiveOnIndex?: boolean;
    activeOptions?: { exact?: boolean };
  } & Record<string, unknown>;

  const mergedParams =
    typeof params === 'function'
      ? (prev: unknown) => ({
          locale,
          ...(params as (p: unknown) => Record<string, unknown>)(prev),
        })
      : { locale, ...((params as Record<string, unknown>) ?? {}) };

  const resolvedActiveOptions = onlyActiveOnIndex
    ? { exact: true, ...activeOptions }
    : activeOptions;

  return (
    <TypedLink
      {...(rest as any)}
      params={mergedParams}
      activeOptions={resolvedActiveOptions}
    />
  );
};

export default Link;
