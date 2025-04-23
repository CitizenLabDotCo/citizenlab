import { QueryKeys } from 'utils/cl-react-query/types';

import { IAnalysysHeatmapCellsParams } from './types';

const baseKey = { type: 'heatmap_cell' };

const analysisHeatmapCellsKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: (filters: IAnalysysHeatmapCellsParams) => [
    { ...baseKey, operation: 'list', parameters: filters },
  ],
} satisfies QueryKeys;

export default analysisHeatmapCellsKeys;
