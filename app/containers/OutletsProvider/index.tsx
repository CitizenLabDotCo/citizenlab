import React, { createContext } from 'react';
import moduleConfiguration from 'modules';
import { parseOutlets } from 'utils/moduleUtils';

const parsedOutlets = parseOutlets(moduleConfiguration.outlets);

export const OutletsContext = createContext(parsedOutlets);

const OutletsProvider = ({ children }) => (
  <OutletsContext.Provider value={parsedOutlets}>
    {children}
  </OutletsContext.Provider>
);

export default OutletsProvider;
