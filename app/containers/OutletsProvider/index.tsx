import React, { createContext } from 'react';
import moduleConfiguration from 'modules';

export const OutletsContext = createContext(moduleConfiguration.outlets);

const OutletsProvider = ({ children }) => (
  <OutletsContext.Provider value={moduleConfiguration.outlets}>
    {children}
  </OutletsContext.Provider>
);

export default OutletsProvider;
