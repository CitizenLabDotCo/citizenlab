import React from 'react';
import useFeatureFlag from 'hooks/useFeatureFlag';
import { Outlet as RouterOutlet } from 'react-router-dom';

export const NAVIGATION_PATH = '/admin/settings/navigation';

export default () => {
  const featureEnabled = useFeatureFlag({ name: 'customizable_navbar' });
  if (!featureEnabled) return null;

  return (
    <>
      <RouterOutlet />
    </>
  );
};
