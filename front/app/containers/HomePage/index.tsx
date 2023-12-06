import React, { useEffect } from 'react';
import clHistory from 'utils/cl-router/history';

// components
import { canAccessRoute } from 'utils/permissions/rules/routePermissions';

// hooks
import useAuthUser from 'api/me/useAuthUser';
import useKeyPress from 'hooks/useKeyPress';

// utils
import { isNilOrError } from 'utils/helperUtils';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import Viewer from './Viewer';
import CityLogoSection from 'components/CityLogoSection';
export const adminRedirectPath = '/admin';

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
    <div id="e2e-landing-page">
      <Viewer />
      <CityLogoSection />
    </div>
  );
};

export default HomePage;
