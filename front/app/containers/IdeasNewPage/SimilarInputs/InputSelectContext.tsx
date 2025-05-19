import { createContext, useContext } from 'react';

interface IInputSelectContext {
  onIdeaSelect: (ideaId: string | null) => void;
  selectedIdeaId: string | null;
  title: string;
  body: string;
  setTitle: (val: string) => void;
  setBody: (val: string) => void;
  showSimilarInputs: boolean;
}

const defaultContext: IInputSelectContext = {
  onIdeaSelect: () => {},
  selectedIdeaId: null,
  showSimilarInputs: false,
  title: '',
  body: '',
  setTitle: () => {},
  setBody: () => {},
};

export const InputSelectContext =
  createContext<IInputSelectContext>(defaultContext);

export const useIdeaSelect = () => useContext(InputSelectContext);
