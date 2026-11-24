import React, { ReactNode } from 'react';

import { useRouter } from '@tanstack/react-router';

import DesignSystemProvider from 'design-system/Provider';

import useLocale from 'hooks/useLocale';

import { getUrlLocale } from 'utils/getUrlLocale';
import { setPathnameLocale } from 'utils/setPathnameLocale';

const isServerPath = (href: string) =>
  /^\/(?:uploads|web_api)(?:[/?#]|$)/.test(href);

const isAppPath = (href: string) =>
  href.startsWith('/') && !href.startsWith('//') && !isServerPath(href);

const AdminDesignSystemProvider = ({ children }: { children: ReactNode }) => {
  const locale = useLocale();
  const router = useRouter();

  const buildHref = (href: string) => {
    if (!isAppPath(href)) return href;

    const url = new URL(href, router.origin);
    const { pathname, search, hash, searchParams } = url;
    const to = getUrlLocale(pathname)
      ? pathname
      : setPathnameLocale(pathname, locale);

    // Let the router retain the preview flag without coercing any supplied
    // query values or changing their original encoding.
    const { publicHref, searchStr } = router.buildLocation({
      to,
      search: {},
    });
    const retained = searchParams.has('project_backoffice_redesign')
      ? ''
      : searchStr;
    const query =
      search && retained
        ? `${search}&${retained.slice(1)}`
        : search || retained;

    const [path] = publicHref.split(/[?#]/, 1);
    return `${path}${query}${hash}`;
  };

  const navigate = (href: string) => {
    if (!isAppPath(href)) {
      void router.navigate({
        href,
        reloadDocument: isServerPath(href) || href.startsWith('//'),
      });
    } else {
      // navigate({ href }) reparses and reserializes the query. A history push
      // preserves it while still running the router's blockers and loaders.
      router.history.push(buildHref(href));
    }
  };

  return (
    <DesignSystemProvider
      locale={locale}
      useHref={buildHref}
      navigate={navigate}
    >
      {children}
    </DesignSystemProvider>
  );
};

export default AdminDesignSystemProvider;
