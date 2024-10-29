import React, { useEffect } from 'react';

import { Spinner } from '@citizenlab/cl2-component-library';
import { RouteType } from 'routes';

import useAdminPublications from 'api/admin_publications/useAdminPublications';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useHomepageLayout from 'api/home_page_layout/useHomepageLayout';
import useAuthUser from 'api/me/useAuthUser';
import useProjectsWithActiveParticipatoryPhase from 'api/projects_mini/useProjectsWithActiveParticipatoryPhase';

import useKeyPress from 'hooks/useKeyPress';

import CityLogoSection from 'components/CityLogoSection';

import clHistory from 'utils/cl-router/history';
import { isNilOrError } from 'utils/helperUtils';
import { canAccessRoute } from 'utils/permissions/rules/routePermissions';

import Viewer from './Viewer';

export const adminRedirectPath: RouteType = '/admin';

const HomePage = () => {
  const { data: homepageLayout } = useHomepageLayout();
  const { data: authUser } = useAuthUser();
  const { data: appConfiguration } = useAppConfiguration();

  // TODO REMOVE
  const { data: projects } = useProjectsWithActiveParticipatoryPhase({
    'page[number]': 1,
    'page[size]': 6,
  });
  console.log({ projects });
  // TODO REMOVE

  // Hack to already fetch this data assuming the platform
  // will have published data. If not, worst case we make this request twice.
  // Using the prefetchData.ts method doesn't work because of pagination.
  useAdminPublications({
    pageSize: 6,
    publicationStatusFilter: ['published'],
    rootLevelOnly: true,
    removeNotAllowedParents: true,
    topicIds: null,
    areaIds: null,
    search: null,
    include_publications: true,
  });

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

  if (!homepageLayout) return <Spinner />;

  return (
    <main id="e2e-landing-page">
      <Viewer />
      <CityLogoSection />
    </main>
  );
};

export default HomePage;
