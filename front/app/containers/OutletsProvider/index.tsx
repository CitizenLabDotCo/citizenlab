import React, { createContext, ReactNode, useContext } from 'react';

import { PluginsContext } from 'containers/PluginsProvider';

export const OutletsContext = createContext({});

interface Props {
  children: ReactNode;
}

const OutletsProvider = ({ children }: Props) => {
  const { merged } = useContext(PluginsContext);

  return (
    <OutletsContext.Provider value={merged.outlets}>
      {children}
    </OutletsContext.Provider>
  );
};

export default OutletsProvider;
