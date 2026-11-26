import { createContext } from 'react';

type ExpandAll = {
  // Goes up on each press; every PanelGroup under the provider then opens or closes.
  count: number;
  // What the last press did: open every card, or close them.
  opened: boolean;
  toggle?: () => void;
};

const ExpandAllContext = createContext<ExpandAll>({ count: 0, opened: false });

export default ExpandAllContext;
