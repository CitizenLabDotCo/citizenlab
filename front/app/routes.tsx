import React, { lazy } from 'react';

import { testingRoutes } from 'amandaTesting';
import { route, string } from 'react-router-typesafe-routes/dom';

import PageLoading from 'components/UI/PageLoading';

const HomePage = lazy(() => import('containers/HomePage'));

// *********************************************************************
// Create ROUTES object
// *********************************************************************
export const ROUTES = {
  Homepage: route(
    ':locale',
    {
      params: { locale: string() },
    },
    // Testing child route from a different file
    { ...testingRoutes }
  ),
  Admin: route(
    ':locale/admin', // We should be able to nest this under "Homepage" though. Just testing it like this for now.
    {},
    { TestChildRoute2: route('admin-child-route') }
  ),
};

// *********************************************************************
// Create a createRoutes function, which our root.tsx uses to build the routes
// *********************************************************************
const createRoutes = () => {
  const routesArray = [] as any[];

  for (const [key, value] of Object.entries(ROUTES)) {
    // Access any children + add to array as well
    const children = value['$'];
    if (children) {
      console.log('Adding child paths to array...');
      for (const [key, value] of Object.entries(children)) {
        console.log('route(key): ', route(key));
        routesArray.push({
          path: value.path, // ISSUE: This won't work. This doesn't actually build the full path with parent.
          // Another annoying thing - in the FO if we wanted to build a deeply nested route, we'd have to manually build the path like this:
          // PARENT.NextChild.NextChild2.NextChild3.NextChild4... etc  --> Pretty verbose.. would be ncier to just say "NextChild4" for example..
          element: routeElements[key],
        });
      }
    }

    // Add main route to array
    console.log('Adding main path to array...');
    if (key && value) {
      routesArray.push({
        path: value?.path,
        element: routeElements[key],
      });
    }
  }

  return routesArray;
};

export default createRoutes;

// *********************************************************************
// Create a routeElements object, which can store the elements for each route
// *********************************************************************
const routeElements = {
  Homepage: (
    <PageLoading>
      ****** HOMEPAGE ******
      <HomePage />
    </PageLoading>
  ),
  Admin: <PageLoading>****** ADMIN ******</PageLoading>,
  TestChildRoute: <PageLoading>****** TEST CHILD ROUTE ******</PageLoading>,
  TestChildRoute2: <PageLoading>****** TEST CHILD ROUTE 2 ******</PageLoading>,
};
