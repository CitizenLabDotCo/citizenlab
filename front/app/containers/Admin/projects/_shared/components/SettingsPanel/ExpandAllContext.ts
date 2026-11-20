import { createContext } from 'react';

type ExpandAll = {
  // Goes up on each Expand all press; every PanelGroup under the provider opens on a new count.
  count: number;
  expand?: () => void;
};

const ExpandAllContext = createContext<ExpandAll>({ count: 0 });

export default ExpandAllContext;
