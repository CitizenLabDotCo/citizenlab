import { Keys } from 'utils/cl-react-query/types';

import pluginKeys from './keys';

export type PluginKeys = Keys<typeof pluginKeys>;

export interface PluginFrontEntryData {
  id: string;
  type: 'plugin_front_entry';
  attributes: {
    url: string;
  };
}

export interface PluginFrontEntriesResponse {
  data: PluginFrontEntryData[];
}
