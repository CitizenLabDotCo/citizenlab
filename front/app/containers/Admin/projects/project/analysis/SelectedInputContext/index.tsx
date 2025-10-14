import React, {
  Dispatch,
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react';

import { useSearch } from 'utils/router';

const Context = createContext<{
  selectedInputId: string | null;
  setSelectedInputId: Dispatch<React.SetStateAction<string | null>>;
}>({
  selectedInputId: null,
  setSelectedInputId: () => {},
});

const SelectedInputContext = ({ children }) => {
  const [selectedInputId, setSelectedInputId] = useState<string | null>(null);
  const [search] = useSearch({ strict: false });
  const inputId = search.get('selected_input_id');

  useEffect(() => {
    if (inputId) {
      setSelectedInputId(inputId);
      const element = document.getElementById(`input-${inputId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [inputId]);

  const contextValue = { selectedInputId, setSelectedInputId };
  return <Context.Provider value={contextValue}>{children}</Context.Provider>;
};

export const useSelectedInputContext = () => {
  return useContext(Context);
};

export default SelectedInputContext;
