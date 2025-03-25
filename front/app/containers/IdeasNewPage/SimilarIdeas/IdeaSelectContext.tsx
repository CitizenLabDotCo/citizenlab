import { createContext, useContext } from 'react';

interface IIdeaSelectContext {
  onIdeaSelect: (ideaId: string | null) => void;
}

const defaultContext: IIdeaSelectContext = {
  onIdeaSelect: () => {},
};

export const IdeaSelectContext =
  createContext<IIdeaSelectContext>(defaultContext);

export const useIdeaSelect = () => useContext(IdeaSelectContext);
