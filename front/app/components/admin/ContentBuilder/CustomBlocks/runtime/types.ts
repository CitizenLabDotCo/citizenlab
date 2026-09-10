import { ComponentType } from 'react';

import { BlockConfigValues } from 'api/custom_blocks/types';

// The contract of a compiled block module: a default-exported component that
// receives its per-instance config and a message lookup for the current
// locale. Everything else comes from 'gv-sdk' imports.
export interface BlockProps {
  config: BlockConfigValues;
  msg: (key: string) => string;
}

export interface CustomBlockModule {
  default: ComponentType<BlockProps>;
}
