import { createContext, useContext } from 'react';

export type OptionPlacement = {
  index: number;
  start: number;
  setSize: number;
};

type VirtualizedMenuContextValue = {
  placementOf: (data: unknown) => OptionPlacement | undefined;
  measureElement: (element: HTMLElement | null) => void;
};

export const VirtualizedMenuContext =
  createContext<VirtualizedMenuContextValue | null>(null);

export const useOptionPlacement = (data: unknown) => {
  const context = useContext(VirtualizedMenuContext);
  const placement = context?.placementOf(data);

  if (!context || !placement) return null;

  return { ...placement, measureElement: context.measureElement };
};
