import React, {
  Dispatch,
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react';
import { useSearchParams } from 'react-router-dom';
import { removeSearchParams } from 'utils/cl-router/removeSearchParams';

const Context = createContext<{
  selectedInputId: string | null;
  setSelectedInputId: Dispatch<React.SetStateAction<string | null>>;
}>({
  selectedInputId: null,
  setSelectedInputId: () => {},
});

const SelectedInputContext = ({ children }) => {
  const [selectedInputId, setSelectedInputId] = useState<string | null>(null);
  const [search] = useSearchParams();
  const inputId = search.get('selected-input-id');

  useEffect(() => {
    if (inputId) {
      setSelectedInputId(inputId);
      const element = document.getElementById(`input-${inputId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    removeSearchParams(['selected-input-id']);
  }, [inputId]);

  const contextValue = { selectedInputId, setSelectedInputId };
  return <Context.Provider value={contextValue}>{children}</Context.Provider>;
};

export const useSelectedInputContext = () => {
  return useContext(Context);
};

export default SelectedInputContext;
