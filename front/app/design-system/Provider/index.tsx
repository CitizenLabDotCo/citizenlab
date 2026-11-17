import React, { ReactNode } from 'react';

import { I18nProvider, RouterProvider } from 'react-aria-components';

import '../tokens.css';

type Props = {
  children: ReactNode;
  // BCP 47 locale of the platform, so dates, numbers and RTL follow it instead of the browser.
  locale: string;
  // Client-side navigation for every design-system link (Link, Breadcrumb).
  navigate: (path: string) => void;
};

const DesignSystemProvider = ({ children, locale, navigate }: Props) => (
  <I18nProvider locale={locale}>
    <RouterProvider navigate={navigate}>{children}</RouterProvider>
  </I18nProvider>
);

export default DesignSystemProvider;
