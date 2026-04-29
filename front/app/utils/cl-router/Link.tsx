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

// Make `locale` optional inside a resolved params object/reducer while keeping
// every other key strictly typed against the route tree. Distributes over the
// `true | object | (prev) => object` union that TanStack emits for `params`.
type WithOptionalLocale<TP> = TP extends true
  ? TP
  : TP extends (...args: infer A) => infer R
  ? (...args: A) => WithOptionalLocale<R>
  : TP extends Record<string, unknown>
  ? Omit<TP, 'locale'> & {
      locale?: TP extends { locale: infer L } ? L : string;
    }
  : TP;

// `never` if every key of T is optional, else the union of required keys.
// Used to decide whether `params` itself can be demoted from required to
// optional after `locale` is made optional within it.
type RequiredKeysOf<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];

// Replace the resolved `params` shape on `LinkComponentProps` with a
// locale-optional version. If `locale` was the only required param on the
// route (so making it optional leaves no required keys), `params` itself is
// also demoted to optional — otherwise required-ness is preserved.
type WithLocaleAwareParams<P> = P extends { params: infer TP }
  ? [
      RequiredKeysOf<Extract<WithOptionalLocale<TP>, Record<string, unknown>>>
    ] extends [never]
    ? Omit<P, 'params'> & { params?: WithOptionalLocale<TP> }
    : Omit<P, 'params'> & { params: WithOptionalLocale<TP> }
  : P extends { params?: infer TP }
  ? Omit<P, 'params'> & { params?: WithOptionalLocale<TP> }
  : P;

// Wrapper-specific Link signature: `to`, `params`, and `search` keep full
// TanStack type-safety against the route tree. The only relaxation is that
// `locale` is optional within `params` — the wrapper auto-injects it from
// `useLocale()`. Other route params (e.g. `projectId`) remain required.
type LocaleAwareLink<TComp> = <
  TRouter extends AnyRouter = RegisteredRouter,
  const TFrom extends string = string,
  const TTo extends string | undefined = undefined,
  const TMaskFrom extends string = TFrom,
  const TMaskTo extends string = ''
>(
  props: WithLocaleAwareParams<
    LinkComponentProps<TComp, TRouter, TFrom, TTo, TMaskFrom, TMaskTo>
  >
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
  const { params, onlyActiveOnIndex, activeOptions, ...rest } = props;

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
    params: mergedParams,
    activeOptions: resolvedActiveOptions,
  } as React.ComponentProps<typeof TypedLink>;

  return <TypedLink {...linkProps} />;
};

export default Link as LocaleAwareLink<typeof Inner>;
