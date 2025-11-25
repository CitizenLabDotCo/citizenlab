import { DemographicsResponse } from 'api/graph_data_units/responseTypes/DemographicsWidget';

import { Localize } from 'hooks/useLocalize';

import {
  transformDemographicsToChartRows,
  DemographicChartRow,
} from 'utils/demographics';

export type { DemographicChartRow };

/**
 * Convert Report Builder demographics response to ComparisonBarChart format
 * Uses shared demographics transformation utilities
 */
export const toChartData = (
  response: DemographicsResponse,
  localize: Localize,
  blankLabel: string,
  customFieldCode?: string
): DemographicChartRow[] => {
  return transformDemographicsToChartRows(
    response.data.attributes,
    customFieldCode,
    blankLabel,
    (_key, multiloc) => (multiloc ? localize(multiloc) : _key)
  );
};
