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
  rowCategoryId,
  columnCategoryType,
  columnCategoryId,
  maxPValue,
  minLiftDiff,
  unit,
  pageSize = 1000,
  pageNumber = 1,
}: IAnalysysHeatmapCellsParams) =>
  fetcher<IAnalysisHeatmapCells>({
    path: `/analyses/${analysisId}/heatmap_cells`,
    action: 'get',
    queryParams: {
      'page[size]': pageSize,
      'page[number]': pageNumber,
      row_category_type: rowCategoryType,
      row_category_id: rowCategoryId,
      column_category_type: columnCategoryType,
      column_category_id: columnCategoryId,
      max_p_value: maxPValue,
      min_lift_diff: minLiftDiff,
      unit,
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
    refetchInterval: 1000 * 60, // 1 minute
    keepPreviousData: false,
  });
};

export default useAnalysisHeatmapCells;
