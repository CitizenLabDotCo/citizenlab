import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import analysesKeys from './keys';
import {
  IAnalysisHeatmapCells,
  AnalysisHeatmapCellsKeys,
  IAnalysysHeatmapCellsParams,
} from './types';

const fetchAnalysisHeatmapCells = ({
  analysisId,
  pageSize = 1000,
  pageNumber = 1,
}: IAnalysysHeatmapCellsParams) =>
  fetcher<IAnalysisHeatmapCells>({
    path: `/analyses/${analysisId}/heatmap_cells`,
    action: 'get',
    queryParams: {
      'page[size]': pageSize,
      'page[number]': pageNumber,
      row_category_type: 'tags',
      column_category_type: 'user_custom_field',
      column_category_type_id: '6106ebc9-0b9c-43e1-af24-04a2bdbaa26c',
    },
  });

const useAnalysisHeatmapCells = ({
  analysisId,
}: IAnalysysHeatmapCellsParams) => {
  return useQuery<
    IAnalysisHeatmapCells,
    CLErrors,
    IAnalysisHeatmapCells,
    AnalysisHeatmapCellsKeys
  >({
    queryKey: analysesKeys.list({ analysisId }),
    queryFn: () => fetchAnalysisHeatmapCells({ analysisId }),
  });
};

export default useAnalysisHeatmapCells;
