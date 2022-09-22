import moduleConfiguration from 'modules';
import React, { createContext } from 'react';

export const OutletsContext = createContext({});

const OutletsProvider = ({ children }) => {
  return (
    <OutletsContext.Provider value={moduleConfiguration.outlets}>
      {children}
    </OutletsContext.Provider>
  );
};

export default OutletsProvider;
