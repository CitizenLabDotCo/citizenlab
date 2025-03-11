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
  rowCategoryType,
  columnCategoryType,
  columnCategoryTypeId,
  maxPValue,
  minLiftDiff,
  pageSize = 1000,
  pageNumber = 1,
}: IAnalysysHeatmapCellsParams) =>
  fetcher<IAnalysisHeatmapCells>({
    path: `/analyses/${analysisId}/heatmap_cells`,
    action: 'get',
    queryParams: {
      'page[size]': pageSize,
      'page[number]': pageNumber,
      row_category_type: rowCategoryType || 'tags',
      column_category_type: columnCategoryType || 'user_custom_field',
      column_category_type_id: columnCategoryTypeId,
      max_p_value: maxPValue,
      min_lift_diff: minLiftDiff,
    },
  });

const useAnalysisHeatmapCells = (params: IAnalysysHeatmapCellsParams) => {
  return useQuery<
    IAnalysisHeatmapCells,
    CLErrors,
    IAnalysisHeatmapCells,
    AnalysisHeatmapCellsKeys
  >({
    queryKey: analysesKeys.list(params),
    queryFn: () => fetchAnalysisHeatmapCells(params),
  });
};

export default useAnalysisHeatmapCells;
