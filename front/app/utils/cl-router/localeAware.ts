import type { LinkProps } from '@tanstack/react-router';

// Strip the leading `/$locale` segment from a typed-route literal so callsites
// can pass raw paths like `/admin/users` or `/projects/$slug`. The Link/Navigate
// wrappers auto-prepend `/$locale` at runtime, so consumers shouldn't have to
// write it.
export type StripLocale<T> = T extends '/$locale'
  ? '/'
  : T extends `/$locale/${infer Rest}`
  ? `/${Rest}`
  : T;

// The set of `to` values the wrappers accept. Includes both the stripped form
// (preferred) and the original prefixed form (for transitional callsites and
// any code that passes typed routes through unchanged).
export type WrapperTo =
  | StripLocale<NonNullable<LinkProps['to']>>
  | LinkProps['to'];

// Inverse of StripLocale — adds `/$locale` back so we feed TanStack the real
// registered route literal for params/search type correlation when callsites
// pass the stripped form.
export type AddLocale<T> = T extends `/$locale${string}`
  ? T
  : T extends '/'
  ? '/$locale'
  : T extends `/${infer Rest}`
  ? `/$locale/${Rest}`
  : T;

// Shared shape for components that forward a typed-link target to Link or
// ButtonWithLink. `to` is the typed-route literal (compile-checked against the
// route tree); `params` and `search` are loose at this boundary because the
// strict typing kicks in at the consuming Link callsite.
export type TypedLinkProps = {
  to?: WrapperTo;
  params?: Record<string, string>;
  search?: Record<string, unknown>;
};

// Make `locale` optional inside a resolved params object/reducer while keeping
// every other key strictly typed against the route tree. Distributes over the
// `true | object | (prev) => object` union that TanStack emits for `params`.
export type WithOptionalLocale<TP> = TP extends true
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
export type RequiredKeysOf<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];

// Replace the resolved `params` shape on a TanStack props type with a
// locale-optional version. If `locale` was the only required param on the
// route (so making it optional leaves no required keys), `params` itself is
// also demoted to optional — otherwise required-ness is preserved.
export type WithLocaleAwareParams<P> = P extends { params: infer TP }
  ? [
      RequiredKeysOf<Extract<WithOptionalLocale<TP>, Record<string, unknown>>>
    ] extends [never]
    ? Omit<P, 'params'> & { params?: WithOptionalLocale<TP> }
    : Omit<P, 'params'> & { params: WithOptionalLocale<TP> }
  : P extends { params?: infer TP }
  ? Omit<P, 'params'> & { params?: WithOptionalLocale<TP> }
  : P;
