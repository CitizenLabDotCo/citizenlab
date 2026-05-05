import React from 'react';

import {
  type ActiveOptions,
  type AnyRouter,
  createLink,
  type CreateLinkProps,
  type LinkComponent,
  type LinkComponentProps,
  type RegisteredRouter,
} from '@tanstack/react-router';
import styled from 'styled-components';

import useLocale from 'hooks/useLocale';

import { scrollToTop as scrollTop } from 'utils/scroll';

import type { AddLocale, WithLocaleAwareParams } from './localeAware';

export type { WrapperTo, TypedLinkProps } from './localeAware';

// styled-components erases the generic-function shape of typed router
// components like cl-router/Link, so `styled(Link)` drops route-aware typing.
// Use `typedStyled(Link)` instead of casting `as typeof Link` to preserve the
// wrapped component's full type.
export function typedStyled<C>(component: C) {
  return styled(
    component as unknown as React.ComponentType<unknown>
  ) as unknown as (
    strings: TemplateStringsArray,
    ...interpolations: unknown[]
  ) => C;
}

interface ExtraProps {
  scrollToTop?: boolean;
  onlyActiveOnIndex?: boolean;
}

type InnerProps = CreateLinkProps &
  ExtraProps &
  React.AnchorHTMLAttributes<HTMLAnchorElement>;

const Inner = React.forwardRef<HTMLAnchorElement, InnerProps>(
  ({ scrollToTop, onlyActiveOnIndex: _i, onClick, ...rest }, ref) => (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
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

// Wrapper-specific Link signature: `to` accepts the stripped form (preferred,
// e.g. `/admin/users`) or the prefixed form (e.g. `/$locale/admin/users`).
// `params` and `search` keep TanStack type-safety against the route tree —
// internally we feed TanStack `AddLocale<TTo>` so the strict route literal
// drives params/search shape resolution. The locale is optional within
// `params` — the wrapper auto-injects it from `useLocale()`. Other route
// params (e.g. `projectId`) remain required.
type LocaleAwareLink<TComp> = <
  TRouter extends AnyRouter = RegisteredRouter,
  const TFrom extends string = string,
  const TTo extends string | undefined = undefined,
  const TMaskFrom extends string = TFrom,
  const TMaskTo extends string = ''
>(
  props: Omit<
    WithLocaleAwareParams<
      LinkComponentProps<
        TComp,
        TRouter,
        TFrom,
        TTo extends string ? AddLocale<TTo> : TTo,
        TMaskFrom,
        TMaskTo
      >
    >,
    'to'
  > & { to?: TTo }
) => React.ReactElement;

// Implementation-side props: the public `LocaleAwareLink<>` signature is the
// source of truth (applied via the cast on `export default` below). Internally
// we widen `params` and `activeOptions` to the loose union TanStack emits so
// the body can destructure and remap without per-call generic resolution.
type ParamsValue =
  | true
  | Record<string, unknown>
  | ((prev: unknown) => Record<string, unknown>);

type LinkImplProps = ExtraProps &
  Omit<CreateLinkProps, 'params' | 'activeOptions'> &
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    params?: ParamsValue;
    activeOptions?: ActiveOptions;
  };

const Link = (props: LinkImplProps) => {
  const locale = useLocale();
  const { to, params, onlyActiveOnIndex, activeOptions, ...rest } = props;

  // Auto-prepend `/$locale` to absolute internal paths that don't already have
  // it. Mirrors __mocks__/Link.tsx so test href assertions match runtime.
  const resolvedTo =
    typeof to === 'string' && to.startsWith('/') && !to.startsWith('/$locale')
      ? `/$locale${to}`
      : to;

  const mergedParams =
    typeof params === 'function'
      ? (prev: unknown) => ({ locale, ...params(prev) })
      : params && params !== true
      ? { locale, ...params }
      : { locale };

  const resolvedActiveOptions = onlyActiveOnIndex
    ? { exact: true, ...activeOptions }
    : activeOptions;

  // Single contained cast: the public `LocaleAwareLink<>` type already enforces
  // the route-aware shape on callers; here we hand the resolved (locale-merged)
  // props to `TypedLink`, whose generic param/search types we've intentionally
  // erased to keep the wrapper non-generic.
  const linkProps = {
    ...rest,
    to: resolvedTo,
    params: mergedParams,
    activeOptions: resolvedActiveOptions,
  } as React.ComponentProps<typeof TypedLink>;

  return <TypedLink {...linkProps} />;
};

export default Link as LocaleAwareLink<typeof Inner>;
