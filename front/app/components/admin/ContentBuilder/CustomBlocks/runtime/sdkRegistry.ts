import * as React from 'react';

// eslint-disable-next-line no-restricted-imports
import {
  Box,
  Text,
  Title,
  Button,
  Icon,
  Spinner,
  colors,
} from '@citizenlab/cl2-component-library';
import * as jsxRuntime from 'react/jsx-runtime';
import { useTheme } from 'styled-components';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useAuthUser from 'api/me/useAuthUser';
import useProjectsMini from 'api/projects_mini/useProjectsMini';

import useLocale from 'hooks/useLocale';
import useLocalize from 'hooks/useLocalize';

import Link from 'utils/cl-router/Link';

import { SDK_EXPORT_NAMES, SdkExportName } from './sdkContract';

declare global {
  interface Window {
    __GV_SDK__?: { v1?: Record<string, unknown> };
  }
}

const buildSdkV1 = (): Record<SdkExportName, unknown> => ({
  React,
  jsx: (jsxRuntime as Record<string, unknown>).jsx,
  jsxs: (jsxRuntime as Record<string, unknown>).jsxs,
  Fragment: jsxRuntime.Fragment,
  Box,
  Text,
  Title,
  Button,
  Icon,
  Spinner,
  colors,
  useAuthUser,
  useProjectsMini,
  useAppConfiguration,
  useLocale,
  useLocalize,
  useTheme,
  Link,
});

// Idempotent. Called by the block loader before any block module is imported;
// the shim at SDK_SHIM_URL reads window.__GV_SDK__.v1.
export const installCustomBlockSdk = () => {
  const registry = (window.__GV_SDK__ = window.__GV_SDK__ ?? {});
  if (!registry.v1) {
    const sdk = buildSdkV1();

    if (process.env.NODE_ENV === 'development') {
      const missing = SDK_EXPORT_NAMES.filter(
        (name) => sdk[name] === undefined
      );
      if (missing.length > 0) {
        // eslint-disable-next-line no-console
        console.error('Custom block SDK is missing exports:', missing);
      }
    }

    registry.v1 = sdk;
  }
};
