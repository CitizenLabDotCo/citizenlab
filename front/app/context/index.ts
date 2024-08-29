import React from 'react';

import { RouteType } from 'routes';

export const PreviousPathnameContext = React.createContext<RouteType | null>(
  null
);
