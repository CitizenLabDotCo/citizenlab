import React from 'react';

import { Navigate, useLocation } from 'react-router';

interface RelativeNavigateProps {
  to: string;
  replace?: boolean;
}

/**
 * A component that navigates to a path relative to the current location
 * This is needed for React Router v7 where relative <Navigate/> behavior changed
 */
const RelativeNavigate = ({ to, replace = false }: RelativeNavigateProps) => {
  const location = useLocation();

  // Get the current path without trailing slash
  const currentPath = location.pathname.replace(/\/$/, '');

  // Remove leading slash or ./ from the target path if present
  const cleanedTarget = to.replace(/^(\.\/|\/)/, '');

  // Combine the current path with the target path
  const fullPath = `${currentPath}/${cleanedTarget}`;

  return <Navigate to={fullPath} replace={replace} />;
};

export default RelativeNavigate;
