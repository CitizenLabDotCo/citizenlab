import React from 'react';

import {
  type AnyRouter,
  createLink,
  type CreateLinkProps,
  type LinkComponent,
  type LinkComponentProps,
  type RegisteredRouter,
} from '@tanstack/react-router';

import useLocale from 'hooks/useLocale';
import { scrollToTop as scrollTop } from 'utils/scroll';

interface ExtraProps {
  scrollToTop?: boolean;
  onlyActiveOnIndex?: boolean;
}

type InnerProps = CreateLinkProps &
  ExtraProps &
  React.AnchorHTMLAttributes<HTMLAnchorElement>;

const Inner = React.forwardRef<HTMLAnchorElement, InnerProps>(
  ({ scrollToTop, onlyActiveOnIndex: _i, onClick, ...rest }, ref) => (
    <a
      ref={ref}
      {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      onClick={(e) => {
        onClick?.(e);
        if (scrollToTop) scrollTop('link');
      }}
    />
  )
);
Inner.displayName = 'ClRouterLinkInner';

const TypedLink: LinkComponent<typeof Inner> = createLink(Inner);

// `locale` is part of the route tree (`/$locale/...`) but is auto-injected by
// the wrapper, so callers don't need to include it in `params`. The exported
// type makes `locale` optional within `params` while keeping every other param
// strictly typed against the route tree.
// Wrapper-specific Link signature: `to` keeps full TanStack type-safety against
// the route tree, but `params` is loosened so callers don't have to pass
// `locale` (the wrapper auto-injects it from `useLocale()`). Param-name
// type-checking is sacrificed for the locale ergonomics — runtime validation
// still applies via TanStack itself.
type LocaleAwareLink<TComp> = <
  TRouter extends AnyRouter = RegisteredRouter,
  const TFrom extends string = string,
  const TTo extends string | undefined = undefined,
  const TMaskFrom extends string = TFrom,
  const TMaskTo extends string = ''
>(
  props: Omit<
    LinkComponentProps<TComp, TRouter, TFrom, TTo, TMaskFrom, TMaskTo>,
    'params'
  > & {
    params?: Record<string, string | number | undefined>;
  }
) => React.ReactElement;

const Link = (props: any) => {
  const locale = useLocale();
  const { params, onlyActiveOnIndex, activeOptions, ...rest } = props;

  const mergedParams =
    typeof params === 'function'
      ? (prev: unknown) => ({ locale, ...params(prev) })
      : { locale, ...((params as Record<string, unknown>) ?? {}) };

  const resolvedActiveOptions = onlyActiveOnIndex
    ? { exact: true, ...activeOptions }
    : activeOptions;

  return (
    <TypedLink
      {...rest}
      params={mergedParams}
      activeOptions={resolvedActiveOptions}
    />
  );
};

export default Link as LocaleAwareLink<typeof Inner>;
