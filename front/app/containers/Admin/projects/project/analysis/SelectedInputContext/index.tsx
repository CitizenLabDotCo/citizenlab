import React, { Dispatch, createContext, useContext, useState } from 'react';

const Context = createContext<{
  selectedInputId: string | null;
  setSelectedInputId: Dispatch<React.SetStateAction<string | null>>;
}>({
  selectedInputId: null,
  setSelectedInputId: () => {},
});

const SelectedInputContext = ({ children }) => {
  const [selectedInputId, setSelectedInputId] = useState<string | null>(null);
  const contextValue = { selectedInputId, setSelectedInputId };
  return <Context.Provider value={contextValue}>{children}</Context.Provider>;
};

export const useSelectedInputContext = () => {
  return useContext(Context);
};

export default SelectedInputContext;
