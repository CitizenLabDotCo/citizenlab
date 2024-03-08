import React, { createContext, ReactNode } from 'react';

import moduleConfiguration from 'modules';

export const OutletsContext = createContext({});

interface Props {
  children: ReactNode;
}

const OutletsProvider = ({ children }: Props) => {
  return (
    <OutletsContext.Provider value={moduleConfiguration.outlets}>
      {children}
    </OutletsContext.Provider>
  );
};

export default OutletsProvider;
