import { createContext, useContext } from 'react';

interface IIdeaSelectContext {
  onIdeaSelect: (ideaId: string | null) => void;
  selectedIdeaId: string | null;
  title: string;
  body: string;
  setTitle: (val: string) => void;
  setBody: (val: string) => void;
}

const defaultContext: IIdeaSelectContext = {
  onIdeaSelect: () => {},
  selectedIdeaId: null,
  title: '',
  body: '',
  setTitle: () => {},
  setBody: () => {},
};

export const IdeaSelectContext =
  createContext<IIdeaSelectContext>(defaultContext);

export const useIdeaSelect = () => useContext(IdeaSelectContext);
