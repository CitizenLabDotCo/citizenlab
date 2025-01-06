import React, { useEffect } from 'react';

import { RouteType } from 'routes';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useAuthUser from 'api/me/useAuthUser';

import useKeyPress from 'hooks/useKeyPress';

import CityLogoSection from 'components/CityLogoSection';

import clHistory from 'utils/cl-router/history';
import { isNilOrError } from 'utils/helperUtils';
import { canAccessRoute } from 'utils/permissions/rules/routePermissions';

import HomePageMeta from './HomePageMeta';
import Viewer from './Viewer';

export const adminRedirectPath: RouteType = '/admin';

const HomePage = () => {
  const { data: authUser } = useAuthUser();
  const { data: appConfiguration } = useAppConfiguration();
  const pressedLetterAKey = useKeyPress('a');
  const userHasAdminAccess =
    !isNilOrError(authUser) && !isNilOrError(appConfiguration)
      ? canAccessRoute(
          { type: 'route', path: '/admin' },
          authUser,
          appConfiguration.data
        )
      : false;

  useEffect(() => {
    if (pressedLetterAKey && userHasAdminAccess) {
      clHistory.push(adminRedirectPath);
    }
  }, [pressedLetterAKey, userHasAdminAccess]);

  return (
    <>
      <HomePageMeta />
      <main id="e2e-landing-page">
        <Viewer />
        <CityLogoSection />
      </main>
    </>
  );
};

export default HomePage;
