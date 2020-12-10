import React, { createContext } from 'react';
import moduleConfiguration from 'modules';

export const OutletsContext = createContext({});

const OutletsProvider = ({ children }) => (
  <OutletsContext.Provider value={moduleConfiguration.outlets}>
    {children}
  </OutletsContext.Provider>
);

export default OutletsProvider;
