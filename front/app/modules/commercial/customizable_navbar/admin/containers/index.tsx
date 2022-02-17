import React from 'react';
import useFeatureFlag from 'hooks/useFeatureFlag';

export const NAVIGATION_PATH = '/admin/settings/navigation';

export default ({ children }) => {
  const featureEnabled = useFeatureFlag({ name: 'customizable_navbar' });
  if (!featureEnabled) return null;

  return <>{children}</>;
};
