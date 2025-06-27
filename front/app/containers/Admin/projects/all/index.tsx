import React, { lazy } from 'react';

import useFeatureFlag from 'hooks/useFeatureFlag';

const AdminProjectsListLegacy = lazy(() => import('./legacy'));
const AdminProjectsListNew = lazy(() => import('./new'));

const AdminProjectsList = () => {
  const projectPlanningEnabled = useFeatureFlag({
    name: 'project_planning',
  });

  if (projectPlanningEnabled) {
    return <AdminProjectsListNew />;
  }

  return <AdminProjectsListLegacy />;
};

export default AdminProjectsList;
