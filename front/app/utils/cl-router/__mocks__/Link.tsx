import React from 'react';

const buildHref = (
  to: unknown,
  params: Record<string, unknown> = {}
): string => {
  if (typeof to !== 'string') return '#';
  const withLocale = to.startsWith('/$locale') ? to : `/$locale${to}`;
  return withLocale.replace(/\$([a-zA-Z_][a-zA-Z0-9_]*)/g, (_match, key) => {
    const v = params[key];
    return v == null ? `$${key}` : String(v);
  });
};

const Link = ({
  to,
  params,
  onlyActiveOnIndex: _i,
  scrollToTop: _s,
  activeOptions: _a,
  ...rest
}: any) => {
  const href = buildHref(to, { locale: 'en', ...(params ?? {}) });
  return <a {...rest} href={href} />;
};

// Mirror the runtime helper so styled(Link) wrappers in tests don't crash.
// Passes the component through unchanged — styling isn't asserted in unit
// tests, so this is enough.
export const typedStyled = (component: any) => () => component;

export default Link;
