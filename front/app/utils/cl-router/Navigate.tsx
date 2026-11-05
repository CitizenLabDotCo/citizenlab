import React from 'react';

import {
  type AnyRouter,
  Navigate as TanstackNavigate,
  type NavigateOptions,
  type RegisteredRouter,
} from '@tanstack/react-router';

import useLocale from 'hooks/useLocale';

import type { AddLocale, WithLocaleAwareParams } from './localeAware';

// Wrapper-specific Navigate signature: same locale-aware typing as
// `cl-router/Link`. `to` accepts the stripped form (preferred, e.g.
// `/admin/users`) or the prefixed form (e.g. `/$locale/admin/users`).
// Internally we feed TanStack `AddLocale<TTo>` so the strict registered route
// literal drives params/search shape resolution; the wrapper auto-injects
// `locale` from `useLocale()` at runtime.
type LocaleAwareNavigate = <
  TRouter extends AnyRouter = RegisteredRouter,
  const TFrom extends string = string,
  const TTo extends string | undefined = undefined,
  const TMaskFrom extends string = TFrom,
  const TMaskTo extends string = ''
>(
  props: Omit<
    WithLocaleAwareParams<
      NavigateOptions<
        TRouter,
        TFrom,
        TTo extends string ? AddLocale<TTo> : TTo,
        TMaskFrom,
        TMaskTo
      >
    >,
    'to'
  > & { to?: TTo }
) => React.ReactElement | null;

// Implementation-side props: the public `LocaleAwareNavigate` signature is the
// source of truth (applied via the cast on `export default` below). Internally
// we widen `params` to the loose union TanStack emits so the body can
// destructure and remap without per-call generic resolution.
type ParamsValue =
  | true
  | Record<string, unknown>
  | ((prev: unknown) => Record<string, unknown>);

type NavigateImplProps = Omit<NavigateOptions, 'params'> & {
  params?: ParamsValue;
};

const Navigate = (props: NavigateImplProps) => {
  const locale = useLocale();
  const { to, params, ...rest } = props;

  // Auto-prepend `/$locale` to absolute internal paths that don't already have
  // it. Mirrors the behavior of `cl-router/Link`. `'/'` is special-cased to
  // `'/$locale'` (no trailing slash) so the runtime string lines up with the
  // type-level `AddLocale<'/'>`.
  const resolvedTo =
    typeof to === 'string' && to.startsWith('/') && !to.startsWith('/$locale')
      ? to === '/'
        ? '/$locale'
        : `/$locale${to}`
      : to;

  const mergedParams =
    typeof params === 'function'
      ? (prev: unknown) => ({ locale, ...params(prev) })
      : params && params !== true
      ? { locale, ...params }
      : { locale };

  // Single contained cast: the public `LocaleAwareNavigate` type already
  // enforces the route-aware shape on callers; here we hand the resolved
  // (locale-merged) props to TanStack's Navigate, whose generic param/search
  // types we've intentionally erased to keep the wrapper non-generic.
  const navigateProps = {
    ...rest,
    to: resolvedTo,
    params: mergedParams,
  } as React.ComponentProps<typeof TanstackNavigate>;

  return <TanstackNavigate {...navigateProps} />;
};

export default Navigate as LocaleAwareNavigate;
