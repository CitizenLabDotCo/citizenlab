import React, { ReactNode } from 'react';

import { useRouter } from '@tanstack/react-router';

import DesignSystemProvider from 'design-system/Provider';

import useLocale from 'hooks/useLocale';

import { getUrlLocale } from 'utils/getUrlLocale';
import { setPathnameLocale } from 'utils/setPathnameLocale';

const AdminDesignSystemProvider = ({ children }: { children: ReactNode }) => {
  const locale = useLocale();
  const router = useRouter();

  const buildHref = (href: string) => {
    if (!href.startsWith('/') || href.startsWith('//')) return href;

    const url = new URL(href, router.origin);
    const { pathname, search, hash } = url;
    const to = getUrlLocale(pathname)
      ? pathname
      : setPathnameLocale(pathname, locale);

    return router.buildLocation({
      to,
      search: router.options.parseSearch(search),
      hash: hash.slice(1),
    }).publicHref;
  };

  return (
    <DesignSystemProvider
      locale={locale}
      useHref={buildHref}
      navigate={(href) => void router.navigate({ href: buildHref(href) })}
    >
      {children}
    </DesignSystemProvider>
  );
};

export default AdminDesignSystemProvider;
