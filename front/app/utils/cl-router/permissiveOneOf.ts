import * as yup from 'yup';

// Drop-in replacement for `yup.string().oneOf(values)` that silently coerces
// invalid values to undefined instead of failing validation.
//
// URL search params are best-effort: if a user lands on `?sort=garbage` we
// want the page to render with the field's default (or undefined for
// optional fields), not the route's error boundary. The `.transform` runs
// before validators, so an out-of-range value becomes undefined and `.oneOf`
// no longer applies (it skips undefined when the field is optional/has a
// default).
//
// Usage:
//   sort: permissiveOneOf(ideaSortMethods).default('trending'),
//   view: permissiveOneOf(presentationModes).optional(),
export const permissiveOneOf = <T extends string>(values: readonly T[]) =>
  yup
    .string<T>()
    .transform((v: unknown) =>
      typeof v === 'string' && (values as readonly string[]).includes(v)
        ? v
        : undefined
    )
    .oneOf(values);
